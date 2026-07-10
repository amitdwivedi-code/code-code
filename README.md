# Python CodeNet - Database & DBeaver Guide

Python CodeNet supports both **local SQLite** and **PostgreSQL** (fully compatible with Render PostgreSQL and DBeaver).

---

## 🔌 Connecting your Render PostgreSQL Database in DBeaver

To manage your production database using **DBeaver**:

1. Open **DBeaver** and click **New Database Connection** (`Ctrl+N` or `Cmd+N`).
2. Select **PostgreSQL** and click **Next**.
3. Enter your connection details from your Render Connection String (`postgresql://code_w26t_user:36XTCvx182q4c2QrAiGrKi6ziNvJLejJ@dpg-d98ba17avr4c7398fdgg-a.oregon-postgres.render.com/code_w26t`):
   - **Host**: `dpg-d98ba17avr4c7398fdgg-a.oregon-postgres.render.com`
   - **Database**: `code_w26t`
   - **Port**: `5432`
   - **Username**: `code_w26t_user`
   - **Password**: `36XTCvx182q4c2QrAiGrKi6ziNvJLejJ`
4. **Important (SSL requirement)**: Go to the **Driver properties** or **SSL** tab in DBeaver and ensure **SSL** is enabled (or SSL mode set to `require`).
5. Test connection and click **Finish**.

---

## 🔄 Why wasn't data inserted via DBeaver showing up on the live website immediately?

Previously, the website cached data in a local database instance for fast response times and only synchronized with PostgreSQL on server startup. 

**Update:** The application now includes **automatic background polling (every 10 seconds)**. Any data you insert, update, or delete via DBeaver will automatically sync to the website within 10 seconds without needing to restart your Render service!

