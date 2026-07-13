import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'database.sqlite');
const db = new Database(dbPath);

let pgPool: any = null;
if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    console.log('PostgreSQL persistence pool initialized successfully.');
  } catch (err) {
    console.error('PostgreSQL initialization error:', err);
  }
}


interface TableConfig {
  headers: string[];
  defaultRows: Record<string, any>[];
}

const SCHEMAS: Record<string, TableConfig> = {
  users: {
    headers: ['id', 'username', 'email', 'role', 'status', 'password_hash', 'avatar', 'solved_count', 'attempted_count', 'comments_count', 'code_count', 'reviews_count', 'points'],
    defaultRows: []
  },
  questions: {
    headers: ['id', 'title', 'description', 'difficulty', 'topic', 'tags', 'created_by', 'created_date', 'status', 'expected_time', 'reference_links', 'bookmarked', 'archived'],
    defaultRows: []
  },
  email_logs: {
    headers: ['id', 'recipient', 'subject', 'status', 'error_message', 'timestamp'],
    defaultRows: []
  },
  comments: {
    headers: ['id', 'parent_id', 'question_id', 'user', 'message', 'timestamp', 'likes', 'edited', 'pinned', 'important', 'liked_users'],
    defaultRows: []
  },
  solutions: {
    headers: ['id', 'question_id', 'author', 'approach_name', 'explanation', 'time_complexity', 'space_complexity', 'advantages', 'disadvantages', 'code', 'notes', 'votes_best', 'votes_readable', 'votes_optimized', 'voted_users'],
    defaultRows: []
  },
  code_snippets: {
    headers: ['id', 'question_id', 'author', 'language', 'code', 'timestamp', 'version', 'commit_message'],
    defaultRows: []
  },
  reviews: {
    headers: ['id', 'question_id', 'author', 'reviewer', 'rating', 'suggestions', 'bugs', 'improvements', 'optimization_ideas', 'timestamp'],
    defaultRows: []
  },
  activities: {
    headers: ['id', 'user', 'action', 'target', 'timestamp'],
    defaultRows: []
  },
  notifications: {
    headers: ['id', 'user', 'message', 'type', 'read', 'timestamp'],
    defaultRows: []
  },
  attachments: {
    headers: ['id', 'question_id', 'filename', 'file_path', 'file_type', 'uploaded_by', 'timestamp'],
    defaultRows: []
  },
  tags: {
    headers: ['id', 'name', 'category'],
    defaultRows: []
  },
  sessions: {
    headers: ['token', 'user_id', 'email', 'timestamp'],
    defaultRows: []
  }
};

export function ensureFilesExist() {
  for (const [tableName, config] of Object.entries(SCHEMAS)) {
    // Check if table exists
    const tableCheck = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    if (!tableCheck) {
      const cols = config.headers.map(h => `"${h}" TEXT`).join(', ');
      db.exec(`CREATE TABLE IF NOT EXISTS "${tableName}" (${cols})`);

      if (config.defaultRows.length > 0) {
        const insertStmt = db.transaction((rows: Record<string, any>[]) => {
          for (const row of rows) {
            const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
            const placeholders = Object.keys(row).map(() => '?').join(', ');
            const values = Object.values(row).map(v => v === undefined || v === null ? '' : String(v));
            db.prepare(`INSERT INTO "${tableName}" (${keys}) VALUES (${placeholders})`).run(...values);
          }
        });
        insertStmt(config.defaultRows);
      }
    } else {
      // Ensure all headers exist as columns
      const tableInfo = db.prepare(`PRAGMA table_info("${tableName}")`).all() as { name: string }[];
      const existingCols = new Set(tableInfo.map(c => c.name));
      for (const h of config.headers) {
        if (!existingCols.has(h)) {
          try {
            db.exec(`ALTER TABLE "${tableName}" ADD COLUMN "${h}" TEXT`);
          } catch (e) {
            // column might already exist
          }
        }
      }
    }
  }
}

// Background sync from PostgreSQL if DATABASE_URL is configured (PostgreSQL is master source of truth)
async function syncPostgresToLocal() {
  if (!pgPool) return;
  try {
    for (const [tableName, config] of Object.entries(SCHEMAS)) {
      const cols = config.headers.map(h => `"${h}" TEXT`).join(', ');
      await pgPool.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (${cols})`);

      const res = await pgPool.query(`SELECT * FROM "${tableName}"`);
      let rows = res.rows || [];
      const columns = config.headers;
      
      if (tableName === 'questions') {
        const seen = new Set<string>();
        const uniqueRows: Record<string, any>[] = [];
        for (const row of rows) {
          const t = String(row.title || '').trim().toLowerCase();
          if (t && !seen.has(t)) {
            seen.add(t);
            uniqueRows.push(row);
          }
        }
        rows = uniqueRows;
      }

      const saveTx = db.transaction((dataRows: Record<string, any>[]) => {
        db.prepare(`DELETE FROM "${tableName}"`).run();
        for (const row of dataRows) {
          const presentKeys = columns.filter(c => row[c] !== undefined && row[c] !== null);
          if (presentKeys.length === 0) continue;
          const keysSql = presentKeys.map(k => `"${k}"`).join(', ');
          const placeholders = presentKeys.map(() => '?').join(', ');
          const values = presentKeys.map(k => String(row[k] ?? ''));
          db.prepare(`INSERT INTO "${tableName}" (${keysSql}) VALUES (${placeholders})`).run(...values);
        }
      });
      saveTx(rows);
    }
  } catch (err) {
    console.error('PostgreSQL sync error:', err);
  }
}

if (pgPool) {
  ensureFilesExist();
  syncPostgresToLocal();
  // Poll PostgreSQL every 10 seconds to instantly reflect DBeaver / external DB edits on the website
  setInterval(syncPostgresToLocal, 10000);
}

export function readCSV(tableName: string): Record<string, string>[] {
  ensureFilesExist();
  const config = SCHEMAS[tableName];
  if (!config) throw new Error(`Unknown table: ${tableName}`);
  try {
    const rawRows = db.prepare(`SELECT * FROM "${tableName}"`).all() as Record<string, any>[];
    let rows = rawRows.map(row => {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        clean[k] = v !== null && v !== undefined ? String(v) : '';
      }
      return clean;
    });

    if (tableName === 'questions') {
      const seen = new Set<string>();
      const unique: Record<string, string>[] = [];
      for (const q of rows) {
        const t = (q.title || '').trim().toLowerCase();
        if (t && !seen.has(t)) {
          seen.add(t);
          unique.push(q);
        }
      }
      const diffOrder: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      unique.sort((a, b) => {
        const diffA = diffOrder[a.difficulty] || 2;
        const diffB = diffOrder[b.difficulty] || 2;
        if (diffA !== diffB) return diffA - diffB;
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      });
      return unique;
    }

    return rows;
  } catch (err) {
    console.error(`Error reading table ${tableName}:`, err);
    return [];
  }
}

export function writeCSV(tableName: string, rows: Record<string, any>[]): void {
  ensureFilesExist();
  const config = SCHEMAS[tableName];
  if (!config) throw new Error(`Unknown table: ${tableName}`);

  // Collect all unique keys across rows and config headers
  const allHeadersSet = new Set(config.headers);
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      allHeadersSet.add(key);
    }
  }
  const columns = Array.from(allHeadersSet);

  // Ensure table has all columns
  const tableInfo = db.prepare(`PRAGMA table_info("${tableName}")`).all() as { name: string }[];
  const existingCols = new Set(tableInfo.map(c => c.name));
  for (const h of columns) {
    if (!existingCols.has(h)) {
      try {
        db.exec(`ALTER TABLE "${tableName}" ADD COLUMN "${h}" TEXT`);
      } catch (e) {}
    }
  }

  const saveTx = db.transaction((dataRows: Record<string, any>[]) => {
    db.prepare(`DELETE FROM "${tableName}"`).run();
    for (const row of dataRows) {
      const presentKeys = columns.filter(c => row[c] !== undefined && row[c] !== null);
      if (presentKeys.length === 0) continue;
      const keysSql = presentKeys.map(k => `"${k}"`).join(', ');
      const placeholders = presentKeys.map(() => '?').join(', ');
      const values = presentKeys.map(k => String(row[k]));
      db.prepare(`INSERT INTO "${tableName}" (${keysSql}) VALUES (${placeholders})`).run(...values);
    }
  });

  saveTx(rows);

  // Background sync to PostgreSQL if configured
  if (pgPool) {
    (async () => {
      try {
        for (const h of columns) {
          try {
            await pgPool.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${h}" TEXT`);
          } catch (e) {}
        }
        await pgPool.query(`DELETE FROM "${tableName}"`);
        for (const row of rows) {
          const presentKeys = columns.filter(c => row[c] !== undefined && row[c] !== null);
          if (presentKeys.length === 0) continue;
          const keysSql = presentKeys.map(k => `"${k}"`).join(', ');
          const placeholders = presentKeys.map((_, i) => `$${i + 1}`).join(', ');
          const values = presentKeys.map(k => String(row[k]));
          await pgPool.query(`INSERT INTO "${tableName}" (${keysSql}) VALUES (${placeholders})`, values);
        }
      } catch (err) {
        console.error(`PostgreSQL background sync error for ${tableName}:`, err);
      }
    })();
  }
}

export function logActivity(user: string, action: string, target: string) {
  const activities = readCSV('activities');
  const newId = String(Math.max(0, ...activities.map(a => Number(a.id) || 0)) + 1);
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  activities.unshift({ id: newId, user, action, target, timestamp });
  writeCSV('activities', activities);
}

export function addNotification(user: string, message: string, type: string) {
  const notifications = readCSV('notifications');
  const newId = String(Math.max(0, ...notifications.map(n => Number(n.id) || 0)) + 1);
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  notifications.unshift({ id: newId, user, message, type, read: 'false', timestamp });
  writeCSV('notifications', notifications);
}

export function sendEmailNotification(subject: string, body: string) {
  const users = readCSV('users');
  const emailLogs = readCSV('email_logs');
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const activeUsers = users.filter(u => (!u.status || u.status === 'active') && u.email);
  
  for (const user of activeUsers) {
    const newLogId = String(Math.max(0, ...emailLogs.map(l => Number(l.id) || 0)) + 1);
    emailLogs.unshift({
      id: newLogId,
      recipient: user.email,
      subject,
      status: 'Success',
      error_message: '',
      timestamp
    });
    addNotification(user.username, `Email: ${subject}`, 'email');
  }

  writeCSV('email_logs', emailLogs);
}
