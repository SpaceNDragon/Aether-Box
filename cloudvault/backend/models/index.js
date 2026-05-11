import db from '../config/db.js';

export const User = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, avatar, storageUsed, storageLimit)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.email,
      data.password,
      data.name,
      data.avatar || '',
      data.storageUsed || 0,
      data.storageLimit || 25 * 1024 * 1024 * 1024 // 25GB
    );
    return { id: result.lastInsertRowid, _id: result.lastInsertRowid, ...data };
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT *, id as _id FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT *, id as _id FROM users WHERE id = ?');
    return stmt.get(id);
  },

  update: (id, data) => {
    const fields = [];
    const values = [];
    if (data.name) { fields.push('name = ?'); values.push(data.name); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
    if (data.storageUsed !== undefined) { fields.push('storageUsed = ?'); values.push(data.storageUsed); }
    if (data.isTwoFactorEnabled !== undefined) { fields.push('isTwoFactorEnabled = ?'); values.push(data.isTwoFactorEnabled ? 1 : 0); }
    if (data.twoFactorSecret !== undefined) { fields.push('twoFactorSecret = ?'); values.push(data.twoFactorSecret); }
    if (data.password !== undefined && data.password !== null && data.password !== '') {
      fields.push('password = ?');
      values.push(data.password);
    }

    if (fields.length > 0) {
      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    return User.findById(id);
  },

  updatePassword: (id, hashedPassword) => {
    const stmt = db.prepare('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(hashedPassword, id);
    return User.findById(id);
  }
};

export const Folder = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO folders (userId, name, parentId, path)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(data.userId, data.name, data.parentId || null, data.path || '/');
    return { id: result.lastInsertRowid, _id: result.lastInsertRowid, ...data };
  },

  findByUser: (userId, parentId) => {
    let stmt;
    if (parentId === null || parentId === undefined || parentId === 'root') {
      stmt = db.prepare('SELECT *, id as _id FROM folders WHERE userId = ? AND parentId IS NULL AND deletedAt IS NULL ORDER BY name');
      return stmt.all(userId);
    } else {
      stmt = db.prepare('SELECT *, id as _id FROM folders WHERE userId = ? AND parentId = ? AND deletedAt IS NULL ORDER BY name');
      return stmt.all(userId, parentId);
    }
  },

  findAllByUser: (userId) => {
    const stmt = db.prepare('SELECT *, id as _id FROM folders WHERE userId = ? AND deletedAt IS NULL ORDER BY name');
    return stmt.all(userId);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT *, id as _id FROM folders WHERE id = ?');
    return stmt.get(id);
  },

  update: (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.parentId !== undefined) { fields.push('parentId = ?'); values.push(data.parentId); }
    
    if (fields.length > 0) {
      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      const stmt = db.prepare(`UPDATE folders SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    return Folder.findById(id);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
    stmt.run(id);
  },

  getChildFolders: (parentId) => {
    const stmt = db.prepare('SELECT id FROM folders WHERE parentId = ?');
    return stmt.all(parentId);
  },

  softDelete: (id) => {
    const stmt = db.prepare('UPDATE folders SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  },

  restore: (id) => {
    const stmt = db.prepare('UPDATE folders SET deletedAt = NULL WHERE id = ?');
    stmt.run(id);
  },

  findDeletedByUser: (userId) => {
    const stmt = db.prepare('SELECT *, id as _id FROM folders WHERE userId = ? AND deletedAt IS NOT NULL ORDER BY deletedAt DESC');
    return stmt.all(userId);
  },

  permanentDelete: (id) => {
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
    stmt.run(id);
  },

  emptyTrash: (userId) => {
    const stmt = db.prepare('DELETE FROM folders WHERE userId = ? AND deletedAt IS NOT NULL');
    stmt.run(userId);
  },

  findByNameInParent: (userId, name, parentId) => {
    if (parentId === null || parentId === undefined || parentId === 'root') {
      const stmt = db.prepare('SELECT *, id as _id FROM folders WHERE userId = ? AND LOWER(name) = LOWER(?) AND parentId IS NULL AND deletedAt IS NULL');
      return stmt.get(userId, name);
    }
    const stmt = db.prepare('SELECT *, id as _id FROM folders WHERE userId = ? AND LOWER(name) = LOWER(?) AND parentId = ? AND deletedAt IS NULL');
    return stmt.get(userId, name, parentId);
  }
};

export const File = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO files (userId, name, originalName, mimeType, size, cloudinaryId, cloudinaryUrl, folderId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.userId,
      data.name,
      data.originalName,
      data.mimeType,
      data.size,
      data.cloudinaryId,
      data.cloudinaryUrl,
      data.folderId || null
    );
    return { id: result.lastInsertRowid, _id: result.lastInsertRowid, ...data };
  },

  findByUser: (userId, folderId) => {
    let stmt;
    if (folderId === null || folderId === undefined || folderId === 'root') {
      stmt = db.prepare('SELECT *, id as _id FROM files WHERE userId = ? AND folderId IS NULL AND deletedAt IS NULL ORDER BY createdAt DESC');
      return stmt.all(userId);
    } else {
      stmt = db.prepare('SELECT *, id as _id FROM files WHERE userId = ? AND folderId = ? AND deletedAt IS NULL ORDER BY createdAt DESC');
      return stmt.all(userId, folderId);
    }
  },

  findAllByUser: (userId) => {
    const stmt = db.prepare('SELECT *, id as _id FROM files WHERE userId = ? AND deletedAt IS NULL ORDER BY createdAt DESC');
    return stmt.all(userId);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT *, id as _id FROM files WHERE id = ?');
    return stmt.get(id);
  },

  findByShareLink: (token) => {
    const stmt = db.prepare('SELECT *, id as _id FROM files WHERE shareLink = ?');
    return stmt.get(token);
  },

  update: (id, data) => {
    const fields = [];
    const values = [];
    if (data.name) { fields.push('name = ?'); values.push(data.name); }
    if (data.isPublic !== undefined) { fields.push('isPublic = ?'); values.push(data.isPublic ? 1 : 0); }
    if (data.shareLink) { fields.push('shareLink = ?'); values.push(data.shareLink); }
    if (data.shareLinkExpiry !== undefined) { fields.push('shareLinkExpiry = ?'); values.push(data.shareLinkExpiry); }
    if (data.sharePin !== undefined) { fields.push('sharePin = ?'); values.push(data.sharePin); }
    if (data.folderId !== undefined) { fields.push('folderId = ?'); values.push(data.folderId); }
    if (data.size !== undefined) { fields.push('size = ?'); values.push(data.size); }
    if (data.cloudinaryUrl !== undefined) { fields.push('cloudinaryUrl = ?'); values.push(data.cloudinaryUrl); }
    
    if (fields.length > 0) {
      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      const stmt = db.prepare(`UPDATE files SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    return File.findById(id);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    stmt.run(id);
  },

  findByFolderIds: (folderIds) => {
    const placeholders = folderIds.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT *, id as _id FROM files WHERE folderId IN (${placeholders})`);
    return stmt.all(...folderIds);
  },

  findByNameInFolder: (userId, name, folderId) => {
    if (folderId === null || folderId === undefined || folderId === 'root') {
      const stmt = db.prepare('SELECT *, id as _id FROM files WHERE userId = ? AND LOWER(name) = LOWER(?) AND folderId IS NULL AND deletedAt IS NULL');
      return stmt.get(userId, name);
    }
    const stmt = db.prepare('SELECT *, id as _id FROM files WHERE userId = ? AND LOWER(name) = LOWER(?) AND folderId = ? AND deletedAt IS NULL');
    return stmt.get(userId, name, folderId);
  },

  softDelete: (id) => {
    const stmt = db.prepare('UPDATE files SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  },

  restore: (id) => {
    const stmt = db.prepare('UPDATE files SET deletedAt = NULL WHERE id = ?');
    stmt.run(id);
  },

  permanentDelete: (id) => {
    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    stmt.run(id);
  },

  findDeletedByUser: (userId) => {
    const stmt = db.prepare('SELECT *, id as _id FROM files WHERE userId = ? AND deletedAt IS NOT NULL ORDER BY deletedAt DESC');
    return stmt.all(userId);
  },

  findDeletedById: (id) => {
    const stmt = db.prepare('SELECT *, id as _id FROM files WHERE id = ? AND deletedAt IS NOT NULL');
    return stmt.get(id);
  },

  emptyTrash: (userId) => {
    const stmt = db.prepare('DELETE FROM files WHERE userId = ? AND deletedAt IS NOT NULL');
    stmt.run(userId);
  }
};

export const FileVersion = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO file_versions (fileId, userId, versionNumber, cloudinaryId, cloudinaryUrl, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.fileId, data.userId, data.versionNumber, data.cloudinaryId, data.cloudinaryUrl, data.size);
    return { id: result.lastInsertRowid, _id: result.lastInsertRowid, ...data };
  },

  findByFileId: (fileId) => {
    const stmt = db.prepare('SELECT *, id as _id FROM file_versions WHERE fileId = ? ORDER BY versionNumber DESC');
    return stmt.all(fileId);
  },

  findLatestVersionNumber: (fileId) => {
    const stmt = db.prepare('SELECT MAX(versionNumber) as maxVersion FROM file_versions WHERE fileId = ?');
    const row = stmt.get(fileId);
    return row?.maxVersion || 0;
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT *, id as _id FROM file_versions WHERE id = ?');
    return stmt.get(id);
  },

  deleteByFileId: (fileId) => {
    const stmt = db.prepare('DELETE FROM file_versions WHERE fileId = ?');
    stmt.run(fileId);
  }
};