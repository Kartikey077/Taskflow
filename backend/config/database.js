import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Use /tmp for production (Render/Railway) or local data directory
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/database.sqlite'  // For Render/Railway (ephemeral)
    : join(dataDir, 'database.sqlite');

console.log(`📁 Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Check if users table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, table) => {
    if (!table) {
      // Create fresh tables
      createTables();
    } else {
      // Check if email column exists
      db.get("PRAGMA table_info(users)", (err, columns) => {
        const hasEmail = columns && columns.some(col => col.name === 'email');
        if (!hasEmail) {
          console.log('🔄 Migrating database to add email column...');
          migrateDatabase();
        } else {
          console.log('✅ Database schema is up to date');
        }
      });
    }
  });
});

function createTables() {
  console.log('📦 Creating fresh database...');
  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    ownerId INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ownerId) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    projectId INTEGER NOT NULL,
    assignedTo INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(assignedTo) REFERENCES users(id)
  )`);
  
  console.log('✅ Database tables created');
}

function migrateDatabase() {
  db.run(`CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Migration error:', err);
      return;
    }
    
    db.run(`INSERT INTO users_new (id, username, password, role, created_at)
            SELECT id, username, password, role, created_at FROM users`, (err) => {
      if (err) {
        console.error('Migration copy error:', err);
        return;
      }
      
      db.run(`DROP TABLE users`, (err) => {
        if (err) {
          console.error('Drop table error:', err);
          return;
        }
        
        db.run(`ALTER TABLE users_new RENAME TO users`, (err) => {
          if (err) {
            console.error('Rename error:', err);
            return;
          }
          
          db.run(`UPDATE users SET email = username || '@example.com' WHERE email IS NULL`, (err) => {
            if (err) {
              console.error('Email update error:', err);
              return;
            }
            console.log('✅ Database migration completed');
          });
        });
      });
    });
  });
}

export default db;