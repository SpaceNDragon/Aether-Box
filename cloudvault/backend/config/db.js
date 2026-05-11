import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../cloudvault.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    storageUsed INTEGER DEFAULT 0,
    storageLimit INTEGER DEFAULT 26843545600,
    isTwoFactorEnabled INTEGER DEFAULT 0,
    twoFactorSecret TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    parentId INTEGER,
    path TEXT DEFAULT '/',
    deletedAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    originalName TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    cloudinaryId TEXT NOT NULL,
    cloudinaryUrl TEXT NOT NULL,
    folderId INTEGER,
    isPublic INTEGER DEFAULT 0,
    shareLink TEXT,
    shareLinkExpiry TEXT,
    sharePin TEXT,
    deletedAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (folderId) REFERENCES folders(id)
  );

  CREATE TABLE IF NOT EXISTS file_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    versionNumber INTEGER NOT NULL DEFAULT 1,
    cloudinaryId TEXT NOT NULL,
    cloudinaryUrl TEXT NOT NULL,
    size INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fileId) REFERENCES files(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_files_userId ON files(userId);
  CREATE INDEX IF NOT EXISTS idx_files_folderId ON files(folderId);
  CREATE INDEX IF NOT EXISTS idx_files_deletedAt ON files(deletedAt);
  CREATE INDEX IF NOT EXISTS idx_folders_userId ON folders(userId);
  CREATE INDEX IF NOT EXISTS idx_folders_parentId ON folders(parentId);
  CREATE INDEX IF NOT EXISTS idx_folders_deletedAt ON folders(deletedAt);
  CREATE INDEX IF NOT EXISTS idx_versions_fileId ON file_versions(fileId);
`);

// Add columns if they don't exist (safe migrations)
try { db.exec('ALTER TABLE users ADD COLUMN isTwoFactorEnabled INTEGER DEFAULT 0'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN twoFactorSecret TEXT'); } catch (_) {}
try { db.exec('ALTER TABLE files ADD COLUMN sharePin TEXT'); } catch (_) {}


console.log('✅ SQLite database connected');

export default db;