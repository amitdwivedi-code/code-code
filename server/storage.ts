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
    defaultRows: [
      { id: '1', username: 'WorkSample Admin', email: 'worksample822@gmail.com', role: 'Admin', status: 'active', password_hash: 'hashed_worksample', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', solved_count: '2', attempted_count: '4', comments_count: '5', code_count: '3', reviews_count: '2', points: '340' },
      { id: '2', username: 'Amit', email: 'amit@example.com', role: 'Team Lead', status: 'active', password_hash: 'hashed_amit', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', solved_count: '3', attempted_count: '5', comments_count: '8', code_count: '4', reviews_count: '3', points: '420' }
    ]
  },
  questions: {
    headers: ['id', 'title', 'description', 'difficulty', 'topic', 'tags', 'created_by', 'created_date', 'status', 'expected_time', 'reference_links', 'bookmarked', 'archived'],
    defaultRows: [
      {
        id: '1',
        title: 'Reverse a String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters or string. Implement optimal time and space complexity solutions.',
        difficulty: 'Easy',
        topic: 'Strings',
        tags: 'Python, JavaScript, Two Pointers',
        created_by: 'WorkSample Admin',
        created_date: '2026-06-01',
        status: 'Solved',
        expected_time: '15 mins',
        reference_links: 'https://docs.python.org/3/tutorial/introduction.html',
        bookmarked: 'true',
        archived: 'false'
      },
      {
        id: '2',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        tags: 'Python, Hash Table, JavaScript',
        created_by: 'Amit',
        created_date: '2026-06-03',
        status: 'In Progress',
        expected_time: '20 mins',
        reference_links: '',
        bookmarked: 'false',
        archived: 'false'
      },
      {
        id: '3',
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.',
        difficulty: 'Easy',
        topic: 'Stack',
        tags: 'Python, Stack, Strings',
        created_by: 'WorkSample Admin',
        created_date: '2026-06-05',
        status: 'Not Started',
        expected_time: '25 mins',
        reference_links: '',
        bookmarked: 'false',
        archived: 'false'
      },
      {
        id: '4',
        title: 'Merge Two Sorted Lists',
        description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
        difficulty: 'Medium',
        topic: 'Linked List',
        tags: 'Python, Linked List, Recursion',
        created_by: 'Amit',
        created_date: '2026-06-08',
        status: 'Not Started',
        expected_time: '30 mins',
        reference_links: '',
        bookmarked: 'false',
        archived: 'false'
      },
      {
        id: '5',
        title: 'Binary Tree Level Order Traversal',
        description: 'Given the root of a binary tree, return the level order traversal of its nodes values. (i.e., from left to right, level by level).',
        difficulty: 'Medium',
        topic: 'Trees',
        tags: 'Python, BFS, Binary Tree',
        created_by: 'WorkSample Admin',
        created_date: '2026-06-10',
        status: 'Not Started',
        expected_time: '35 mins',
        reference_links: '',
        bookmarked: 'true',
        archived: 'false'
      }
    ]
  },
  email_logs: {
    headers: ['id', 'recipient', 'subject', 'status', 'error_message', 'timestamp'],
    defaultRows: []
  },
  comments: {
    headers: ['id', 'parent_id', 'question_id', 'user', 'message', 'timestamp', 'likes', 'edited', 'pinned', 'important', 'liked_users'],
    defaultRows: [
      {
        id: '1',
        parent_id: '',
        question_id: '1',
        user: 'Amit',
        message: 'Using string slicing in Python s[::-1] is O(N) time and O(N) space. For O(1) space with mutable array, use two pointers swap.',
        timestamp: '2026-06-01 10:30:00',
        likes: '4',
        edited: 'false',
        pinned: 'true',
        important: 'true',
        liked_users: 'WorkSample Admin,Rahul,Sneha,Amit'
      },
      {
        id: '2',
        parent_id: '',
        question_id: '2',
        user: 'WorkSample Admin',
        message: 'Hash map approach for Two Sum gives O(N) time complexity by storing complements in a dictionary.',
        timestamp: '2026-06-03 14:15:00',
        likes: '2',
        edited: 'false',
        pinned: 'false',
        important: 'false',
        liked_users: 'WorkSample Admin,Amit'
      }
    ]
  },
  solutions: {
    headers: ['id', 'question_id', 'author', 'approach_name', 'explanation', 'time_complexity', 'space_complexity', 'advantages', 'disadvantages', 'code', 'notes', 'votes_best', 'votes_readable', 'votes_optimized'],
    defaultRows: [
      {
        id: '1',
        question_id: '1',
        author: 'WorkSample Admin',
        approach_name: 'Two Pointers In-Place',
        explanation: 'Initialize left and right pointers at opposite ends of the array, swapping characters until they meet in the middle.',
        time_complexity: 'O(N)',
        space_complexity: 'O(1)',
        advantages: 'Extremely memory efficient with constant O(1) space.',
        disadvantages: 'Requires mutable sequence type.',
        code: 'def solution(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1\n    return s',
        notes: 'Great for interviews as it shows awareness of memory overhead.',
        votes_best: '5',
        votes_readable: '4',
        votes_optimized: '6'
      }
    ]
  },
  code_snippets: {
    headers: ['id', 'question_id', 'author', 'language', 'code', 'timestamp', 'version', 'commit_message'],
    defaultRows: [
      {
        id: '1',
        question_id: '1',
        author: 'WorkSample Admin',
        language: 'python',
        code: 'def solution(s):\n    return s[::-1]',
        timestamp: '2026-06-01 10:00:00',
        version: 'v1.0',
        commit_message: 'Initial Python slicing solution'
      }
    ]
  },
  reviews: {
    headers: ['id', 'question_id', 'author', 'reviewer', 'rating', 'suggestions', 'bugs', 'improvements', 'optimization_ideas', 'timestamp'],
    defaultRows: []
  },
  activities: {
    headers: ['id', 'user', 'action', 'target', 'timestamp'],
    defaultRows: [
      { id: '1', user: 'WorkSample Admin', action: 'added Question #1', target: 'Reverse a String', timestamp: '2026-06-01 09:00:00' },
      { id: '2', user: 'Amit', action: 'solved Question #1', target: 'Reverse a String', timestamp: '2026-06-01 11:20:00' }
    ]
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
    defaultRows: [
      { id: '1', name: 'Python', category: 'Language' },
      { id: '2', name: 'JavaScript', category: 'Language' },
      { id: '3', name: 'Arrays & Hashing', category: 'Topic' },
      { id: '4', name: 'Strings', category: 'Topic' },
      { id: '5', name: 'Two Pointers', category: 'Algorithm' },
      { id: '6', name: 'Stack', category: 'Data Structure' },
      { id: '7', name: 'Linked List', category: 'Data Structure' },
      { id: '8', name: 'Trees', category: 'Data Structure' }
    ]
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

// Background sync from/to PostgreSQL if DATABASE_URL is configured
async function syncPostgresToLocal() {
  if (!pgPool) return;
  try {
    for (const [tableName, config] of Object.entries(SCHEMAS)) {
      const cols = config.headers.map(h => `"${h}" TEXT`).join(', ');
      await pgPool.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (${cols})`);

      const res = await pgPool.query(`SELECT * FROM "${tableName}"`);
      if (res.rows && res.rows.length > 0) {
        const rows = res.rows;
        const columns = config.headers;
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
      } else {
        const localRows = db.prepare(`SELECT * FROM "${tableName}"`).all() as Record<string, any>[];
        if (localRows.length > 0) {
          await pgPool.query(`DELETE FROM "${tableName}"`);
          for (const row of localRows) {
            const presentKeys = Object.keys(row).filter(k => row[k] !== undefined && row[k] !== null);
            if (presentKeys.length === 0) continue;
            const keysSql = presentKeys.map(k => `"${k}"`).join(', ');
            const placeholders = presentKeys.map((_, i) => `$${i + 1}`).join(', ');
            const values = presentKeys.map(k => String(row[k]));
            await pgPool.query(`INSERT INTO "${tableName}" (${keysSql}) VALUES (${placeholders})`, values);
          }
        }
      }
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
    const rows = db.prepare(`SELECT * FROM "${tableName}"`).all() as Record<string, any>[];
    return rows.map(row => {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        clean[k] = v !== null && v !== undefined ? String(v) : '';
      }
      return clean;
    });
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
