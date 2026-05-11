import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  RotateCcw,
  Trash as TrashIcon,
  AlertTriangle,
  Loader,
  Eye
} from 'lucide-react';
import api from '../services/api';
import { formatFileSize, formatDate, getFileIcon, getFileColor } from '../utils/formatters';
import FilePreview from '../components/files/FilePreview';
import { useStorage } from '../context/StorageContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function Trash() {
  const { refreshAnalytics } = useStorage();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', type: null });

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/files/trash');
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching trash:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (fileId) => {
    setRestoring(fileId);
    try {
      await api.delete(`/files/trash/${fileId}/restore`);
      setFiles(prevFiles => prevFiles.filter(f => String(f._id || f.id) !== String(fileId)));
      refreshAnalytics();
    } catch (error) {
      console.error('Error restoring file:', error);
      alert(error.response?.data?.message || 'Failed to restore file. Please try again.');
    } finally {
      setRestoring(null);
    }
  };

  const handleRestoreFolder = async (folderId) => {
    setRestoring(folderId);
    try {
      await api.delete(`/folders/trash/${folderId}/restore`);
      setFolders(prevFolders => prevFolders.filter(f => String(f._id || f.id) !== String(folderId)));
      refreshAnalytics();
    } catch (error) {
      console.error('Error restoring folder:', error);
      alert(error.response?.data?.message || 'Failed to restore folder. Please try again.');
    } finally {
      setRestoring(null);
    }
  };

  const triggerPermanentDelete = (file) => {
    setDeleteModal({
      isOpen: true,
      id: file._id || file.id,
      name: file.name,
      type: 'file'
    });
  };

  const triggerPermanentDeleteFolder = (folder) => {
    setDeleteModal({
      isOpen: true,
      id: folder._id || folder.id,
      name: folder.name,
      type: 'folder'
    });
  };

  const triggerEmptyTrash = () => {
    setDeleteModal({
      isOpen: true,
      id: null,
      name: 'all items',
      type: 'empty'
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === 'file') {
      const fileId = deleteModal.id;
      setDeleting(fileId);
      try {
        await api.delete(`/files/${fileId}`);
        setFiles(prevFiles => prevFiles.filter(f => String(f._id || f.id) !== String(fileId)));
        refreshAnalytics();
      } catch (error) {
        console.error('Error deleting file:', error);
        alert(error.response?.data?.message || 'Failed to permanently delete file. Please try again.');
      } finally {
        setDeleting(null);
      }
    } else if (deleteModal.type === 'folder') {
      const folderId = deleteModal.id;
      setDeleting(folderId);
      try {
        await api.delete(`/folders/trash/${folderId}`);
        setFolders(prevFolders => prevFolders.filter(f => String(f._id || f.id) !== String(folderId)));
        refreshAnalytics();
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert(error.response?.data?.message || 'Failed to permanently delete folder. Please try again.');
      } finally {
        setDeleting(null);
      }
    } else if (deleteModal.type === 'empty') {
      try {
        await api.delete('/files/trash/empty');
        setFiles([]);
        setFolders([]);
        refreshAnalytics();
      } catch (error) {
        console.error('Error emptying trash:', error);
        alert(error.response?.data?.message || 'Failed to empty trash. Please try again.');
      }
    }
    setDeleteModal({ isOpen: false, id: null, name: '', type: null });
  };

  const getIconComponent = (mimeType) => {
    const iconName = getFileIcon(mimeType);
    const icons = {
      image: Image,
      video: Video,
      audio: Music,
      archive: Archive,
      file: FileText,
      'file-text': FileText
    };
    return icons[iconName] || FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Trash2 className="w-7 h-7" />
            Trash Bin
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {files.length + folders.length} items in trash
          </p>
        </div>

        {files.length + folders.length > 0 && (
          <button
            onClick={triggerEmptyTrash}
            className="btn bg-error-light dark:bg-error-dark text-white flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Empty Trash
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : files.length === 0 && folders.length === 0 ? (
        <div className="text-center py-20 card">
          <Trash2 className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Trash is empty
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Files you delete will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {folders.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Folders
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map((folder) => (
                  <div key={folder._id} className="card p-4 group relative">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-apple-md flex items-center justify-center mb-3">
                      <Folder className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Deleted {formatDate(folder.deletedAt)}
                    </p>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRestoreFolder(folder._id)}
                        disabled={restoring === folder._id}
                        className="p-1.5 rounded-apple-md bg-success-light/20 text-success-light hover:bg-success-light/30"
                        title="Restore"
                      >
                        {restoring === folder._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => triggerPermanentDeleteFolder(folder)}
                        disabled={deleting === folder._id}
                        className="p-1.5 rounded-apple-md bg-error-light/20 text-error-light hover:bg-error-light/30"
                        title="Delete permanently"
                      >
                        {deleting === folder._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Files
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {files.map((file) => {
                  const IconComponent = getIconComponent(file.mimeType);
                  return (
                    <div key={file._id} className="card p-4 group relative">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="w-full text-left"
                      >
                        <div className={`file-icon ${getFileColor(file.mimeType)} mb-3`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-error-light dark:text-error-dark">
                          Deleted {formatDate(file.deletedAt)}
                        </p>
                      </button>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestore(file._id)}
                          disabled={restoring === file._id}
                          className="p-1.5 rounded-apple-md bg-success-light/20 text-success-light hover:bg-success-light/30"
                          title="Restore"
                        >
                          {restoring === file._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => triggerPermanentDelete(file)}
                          disabled={deleting === file._id}
                          className="p-1.5 rounded-apple-md bg-error-light/20 text-error-light hover:bg-error-light/30"
                          title="Delete permanently"
                        >
                          {deleting === file._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card p-4 bg-warning-light/10 dark:bg-warning-dark/10 border border-warning-light/20 dark:border-warning-dark/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-light dark:text-warning-dark" />
          <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
            Files in trash are automatically deleted after 30 days. You can restore them anytime before then.
          </p>
        </div>
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', type: null })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.type === 'empty' ? 'Empty Trash Bin?' : 'Permanently Delete?'}
        message={
          deleteModal.type === 'empty'
            ? 'Are you sure you want to empty the trash? All files and folders will be permanently deleted and cannot be recovered!'
            : deleteModal.type === 'folder'
            ? `Are you sure you want to permanently delete the folder "${deleteModal.name}" and all of its contents? This action cannot be undone!`
            : `Are you sure you want to permanently delete "${deleteModal.name}"? This action cannot be undone!`
        }
        confirmText={deleteModal.type === 'empty' ? 'Empty Trash' : 'Delete Permanently'}
        isProcessing={deleting !== null}
      />
    </div>
  );
}