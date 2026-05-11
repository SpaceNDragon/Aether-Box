import { File, User, Folder, FileVersion } from '../models/index.js';
import { cloudinary } from '../middleware/upload.js';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const getFiles = async (req, res) => {
  try {
    const { folderId, type } = req.query;
    let files;

    if (type) {
      files = File.findAllByUser(req.user._id);
      files = files.filter(f => {
        if (type === 'video') return f.mimeType?.startsWith('video/');
        if (type === 'image') return f.mimeType?.startsWith('image/');
        if (type === 'audio') return f.mimeType?.startsWith('audio/');
        if (type === 'document') {
          const docTypes = ['pdf', 'document', 'word', 'text', 'sheet', 'presentation', 'rtf', 'odt', 'xlsx', 'docx', 'pptx'];
          return docTypes.some(t => f.mimeType?.toLowerCase().includes(t)) || f.mimeType?.startsWith('text/');
        }
        return true;
      });
    } else {
      files = File.findByUser(req.user._id, folderId);
      files = files.filter(f => {
        if (folderId === 'root' || folderId === undefined || folderId === '') {
          return f.folderId === null;
        }
        return f.folderId == folderId;
      });
    }
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStorageAnalytics = async (req, res) => {
  try {
    const files = File.findAllByUser(req.user._id);
    
    let analytics = {
      image: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
      audio: { count: 0, size: 0 },
      document: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    };

    for (const f of files) {
      if (f.mimeType?.startsWith('image/')) {
        analytics.image.count++;
        analytics.image.size += f.size;
      } else if (f.mimeType?.startsWith('video/')) {
        analytics.video.count++;
        analytics.video.size += f.size;
      } else if (f.mimeType?.startsWith('audio/')) {
        analytics.audio.count++;
        analytics.audio.size += f.size;
      } else if (f.mimeType?.includes('pdf') || f.mimeType?.includes('document') || f.mimeType?.includes('text')) {
        analytics.document.count++;
        analytics.document.size += f.size;
      } else {
        analytics.other.count++;
        analytics.other.size += f.size;
      }
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileObj = { ...file };

    // Fetch raw markdown content if it's a markdown file
    if (fileObj.mimeType === 'text/markdown' || fileObj.name?.endsWith('.md')) {
      try {
        const response = await fetch(fileObj.cloudinaryUrl);
        if (response.ok) {
          fileObj.content = await response.text();
        } else {
          fileObj.content = '';
        }
      } catch (fetchError) {
        console.error('Error fetching markdown content from Cloudinary:', fetchError);
        fileObj.content = '';
      }
    }

    res.json(fileObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folderId = req.body.folderId || null;

    // Check for duplicate file name in same folder
    const existingFile = File.findByNameInFolder(req.user._id, req.file.originalname, folderId);
    if (existingFile) {
      // Clean up the already-uploaded cloudinary file
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(409).json({ message: `A file named "${req.file.originalname}" already exists here.` });
    }

    const user = User.findById(req.user._id);
    const newStorageUsed = user.storageUsed + req.file.size;

    if (newStorageUsed > user.storageLimit) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(400).json({ message: 'Storage limit exceeded' });
    }

    const file = File.create({
      userId: req.user._id,
      name: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      cloudinaryId: req.file.filename,
      cloudinaryUrl: req.file.path,
      folderId
    });

    User.update(req.user._id, { storageUsed: newStorageUsed });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const user = User.findById(req.user._id);
    let totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
    const newStorageUsed = user.storageUsed + totalSize;

    if (newStorageUsed > user.storageLimit) {
      for (const file of req.files) {
        await cloudinary.uploader.destroy(file.filename);
      }
      return res.status(400).json({ message: 'Storage limit exceeded' });
    }

    const files = req.files.map(file =>
      File.create({
        userId: req.user._id,
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        cloudinaryId: file.filename,
        cloudinaryUrl: file.path,
        folderId: req.body.folderId || null
      })
    );

    User.update(req.user._id, { storageUsed: newStorageUsed });

    res.status(201).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, folderId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const user = User.findById(req.user._id);
    const size = Buffer.byteLength(content, 'utf8');
    const newStorageUsed = user.storageUsed + size;

    if (newStorageUsed > user.storageLimit) {
      return res.status(400).json({ message: 'Storage limit exceeded' });
    }

    // Write temp file
    const tempFilePath = path.join(os.tmpdir(), `${crypto.randomBytes(8).toString('hex')}.md`);
    fs.writeFileSync(tempFilePath, content);

    // Upload to cloudinary as raw file
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "raw",
      public_id: `${title.replace(/\s+/g, '_')}_${Date.now()}.md`
    });

    // Delete temp file
    fs.unlinkSync(tempFilePath);

    const file = File.create({
      userId: req.user._id,
      name: `${title}.md`,
      originalName: `${title}.md`,
      mimeType: 'text/markdown',
      size: size,
      cloudinaryId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.secure_url,
      folderId: folderId || null
    });

    User.update(req.user._id, { storageUsed: newStorageUsed });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    try {
      if (file.cloudinaryId) {
        await cloudinary.uploader.destroy(file.cloudinaryId);
      }
    } catch (cloudinaryError) {
      console.error('Error destroying cloudinary file:', cloudinaryError);
    }
    File.delete(req.params.id);

    const user = User.findById(req.user._id);
    const newUsed = Math.max(0, user.storageUsed - file.size);
    User.update(req.user._id, { storageUsed: newUsed });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({
      downloadUrl: file.cloudinaryUrl,
      fileName: file.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareFile = async (req, res) => {
  try {
    const file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    const expiryDays = req.body.expiryDays || 7;
    const pin = req.body.pin || null; // optional 4-digit PIN

    if (expiryDays !== null && (expiryDays < 1 || expiryDays > 365)) {
      return res.status(400).json({ message: 'Expiry days must be between 1 and 365' });
    }

    if (pin && !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    const shareToken = crypto.randomBytes(16).toString('hex');
    const expiryDate = expiryDays === null ? null : new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    File.update(req.params.id, {
      isPublic: true,
      shareLink: shareToken,
      shareLinkExpiry: expiryDate,
      sharePin: pin
    });

    const shareLink = `${req.protocol}://${req.get('host')}/api/files/shared/${shareToken}`;

    res.json({
      shareLink,
      expiresAt: expiryDate,
      hasPin: !!pin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSharedFile = async (req, res) => {
  try {
    const file = File.findByShareLink(req.params.token);

    if (!file) {
      return res.status(404).json({ message: 'File not found or link expired' });
    }

    if (file.shareLinkExpiry && new Date() > new Date(file.shareLinkExpiry)) {
      return res.status(410).json({ message: 'Share link has expired' });
    }

    // If PIN protected, check for PIN in query string
    if (file.sharePin) {
      const providedPin = req.query.pin;
      if (!providedPin) {
        return res.status(401).json({ message: 'This file is PIN protected', requiresPin: true });
      }
      if (providedPin !== file.sharePin) {
        return res.status(403).json({ message: 'Incorrect PIN' });
      }
    }

    res.json({
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      downloadUrl: file.cloudinaryUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFileVersions = async (req, res) => {
  try {
    const file = File.findById(req.params.id);
    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }
    const versions = FileVersion.findByFileId(req.params.id);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreFileVersion = async (req, res) => {
  try {
    const file = File.findById(req.params.id);
    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    const version = FileVersion.findById(req.params.versionId);
    if (!version || version.fileId != req.params.id) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Save current as a new version before restoring
    const latestVersion = FileVersion.findLatestVersionNumber(file._id);
    FileVersion.create({
      fileId: file._id,
      userId: req.user._id,
      versionNumber: latestVersion + 1,
      cloudinaryId: file.cloudinaryId,
      cloudinaryUrl: file.cloudinaryUrl,
      size: file.size
    });

    // Restore the old version's cloudinary URL
    File.update(req.params.id, {
      cloudinaryId: version.cloudinaryId,
      cloudinaryUrl: version.cloudinaryUrl,
      size: version.size
    });

    res.json({ message: 'File restored to version ' + version.versionNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renameFile = async (req, res) => {
  try {
    const { name, content } = req.body;
    let file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
    }

    if (content !== undefined) {
      const user = User.findById(req.user._id);
      const size = Buffer.byteLength(content, 'utf8');
      
      // Calculate change in storage used
      const storageDiff = size - file.size;
      const newStorageUsed = user.storageUsed + storageDiff;

      if (newStorageUsed > user.storageLimit) {
        return res.status(400).json({ message: 'Storage limit exceeded' });
      }

      // Upload/overwrite on Cloudinary
      const tempFilePath = path.join(os.tmpdir(), `${crypto.randomBytes(8).toString('hex')}.md`);
      fs.writeFileSync(tempFilePath, content);

      // We overwrite using the existing cloudinaryId if available
      const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
        resource_type: "raw",
        public_id: file.cloudinaryId
      });

      fs.unlinkSync(tempFilePath);

      updateData.size = size;
      updateData.cloudinaryUrl = uploadResult.secure_url;
      
      // Update user storage
      User.update(req.user._id, { storageUsed: newStorageUsed });
    }

    const updatedFile = File.update(req.params.id, updateData);
    res.json(updatedFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveFile = async (req, res) => {
  try {
    const { folderId } = req.body;

    const file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    const updatedFile = File.update(req.params.id, { folderId: folderId || null });
    res.json(updatedFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkDelete = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: 'No files selected' });
    }

    const deletedFiles = [];

    for (const fileId of fileIds) {
      const file = File.findById(fileId);
      if (file && file.userId == req.user._id) {
        File.softDelete(fileId);
        deletedFiles.push(fileId);
      }
    }

    res.json({ 
      message: 'Files moved to trash successfully',
      deletedCount: deletedFiles.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkDuplicate = async (req, res) => {
  try {
    const { name, folderId } = req.query;
    
    if (!name) {
      return res.status(400).json({ message: 'File name is required' });
    }

    const existingFile = File.findByNameInFolder(req.user._id, name, folderId);
    
    if (existingFile) {
      res.json({ 
        isDuplicate: true, 
        existingFile: {
          _id: existingFile.id,
          name: existingFile.name,
          size: existingFile.size,
          createdAt: existingFile.createdAt
        }
      });
    } else {
      res.json({ isDuplicate: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveToTrash = async (req, res) => {
  try {
    const file = File.findById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.deletedAt) {
      return res.status(400).json({ message: 'File already in trash' });
    }

    File.softDelete(req.params.id);

    res.json({ message: 'File moved to trash' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreFromTrash = async (req, res) => {
  try {
    const file = File.findDeletedById(req.params.id);

    if (!file || file.userId != req.user._id) {
      return res.status(404).json({ message: 'File not found in trash' });
    }

    File.restore(req.params.id);

    res.json({ message: 'File restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrash = async (req, res) => {
  try {
    const files = File.findDeletedByUser(req.user._id);
    const folders = Folder.findDeletedByUser(req.user._id);
    
    res.json({ files, folders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const emptyTrash = async (req, res) => {
  try {
    const files = File.findDeletedByUser(req.user._id);
    
    for (const file of files) {
      try {
        if (file.cloudinaryId) {
          await cloudinary.uploader.destroy(file.cloudinaryId);
        }
      } catch (cloudinaryError) {
        console.error('Error destroying cloudinary file during empty trash:', cloudinaryError);
      }
    }

    File.emptyTrash(req.user._id);
    Folder.emptyTrash && Folder.emptyTrash(req.user._id);

    res.json({ message: 'Trash emptied successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};