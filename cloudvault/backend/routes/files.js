import express from 'express';
import { getFiles, getFile, uploadFile, uploadFiles, deleteFile, downloadFile, shareFile, getSharedFile, renameFile, bulkDelete, checkDuplicate, moveToTrash, restoreFromTrash, getTrash, emptyTrash, moveFile, getStorageAnalytics, createNote, getFileVersions, restoreFileVersion } from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// --- Static/Specific routes first (MUST be before param routes) ---
router.get('/analytics', protect, getStorageAnalytics);
router.post('/note', protect, createNote);
router.get('/shared/:token', getSharedFile);
router.get('/trash', protect, getTrash);
router.delete('/trash/empty', protect, emptyTrash);       // ← MUST be before /trash/:id
router.delete('/trash/:id/restore', protect, restoreFromTrash);
router.delete('/trash/:id', protect, moveToTrash);
router.get('/duplicate', protect, checkDuplicate);
router.delete('/bulk', protect, bulkDelete);

// --- Upload routes ---
router.post('/upload', protect, upload.single('file'), uploadFile);
router.post('/upload-multiple', protect, upload.array('files', 10), uploadFiles);

// --- Param routes (MUST be last) ---
router.get('/', protect, getFiles);
router.get('/:id', protect, getFile);
router.get('/:id/versions', protect, getFileVersions);
router.post('/:id/versions/:versionId/restore', protect, restoreFileVersion);
router.get('/:id/download', protect, downloadFile);
router.post('/:id/share', protect, shareFile);
router.put('/:id', protect, renameFile);
router.put('/:id/move', protect, moveFile);
router.delete('/:id', protect, deleteFile);

export default router;