import express from 'express';
import { getFolders, getFolder, createFolder, renameFolder, deleteFolder, getFolderContents, getBreadcrumbs, restoreFromTrash, permanentDelete } from '../controllers/folderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getFolders);
router.get('/contents/:id', protect, getFolderContents);
router.get('/breadcrumb/:folderId', protect, getBreadcrumbs);
router.get('/:id', protect, getFolder);
router.post('/', protect, createFolder);
router.put('/:id', protect, renameFolder);
// Specific routes first before wildcard :id
router.delete('/trash/:id/restore', protect, restoreFromTrash);
router.delete('/trash/:id', protect, permanentDelete);
router.delete('/:id', protect, deleteFolder); // soft delete

export default router;