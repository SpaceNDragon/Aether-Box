import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus,
  Upload,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Eye,
  Pencil,
  X,
  Check,
  Square,
  CheckSquare,
  Loader,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Scissors,
  Copy,
  Clipboard,
  Info
} from 'lucide-react';
import api from '../services/api';
import { formatFileSize, formatDate, getFileIcon, getFileColor, getThumbnailUrl } from '../utils/formatters';
import FileUpload from '../components/files/FileUpload';
import FilePreview from '../components/files/FilePreview';
import ShareModal from '../components/files/ShareModal';
import NewFolderModal from '../components/folders/NewFolderModal';
import PropertiesModal from '../components/files/PropertiesModal';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function Files() {
  const { folderId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [renameMode, setRenameMode] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isDeleting, setIsDeleting] = useState(false);
  const [sharingFile, setSharingFile] = useState(null);
  const [clipboard, setClipboard] = useState({ operation: null, type: null, items: [] }); // cut or copy operation
  const { fetchUser } = useAuth();
  const { refreshAnalytics } = useStorage();
  const [propertiesItem, setPropertiesItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', type: null });

  const currentFolderId = folderId || 'root';

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setSelectedFiles([]);
    try {
      let filesData = [];
      let foldersData = [];

      if (type === 'folder') {
        const res = await api.get(`/folders?parentId=${currentFolderId}`);
        foldersData = res.data;
      } else if (type === 'file') {
        const res = await api.get(`/files?folderId=${currentFolderId}`);
        filesData = res.data;
      } else if (type) {
        const res = await api.get(`/files?folderId=${currentFolderId}&type=${type}`);
        filesData = res.data;
      } else {
        const [filesRes, foldersRes] = await Promise.all([
          api.get(`/files?folderId=${currentFolderId}`),
          api.get(`/folders?parentId=${currentFolderId}`)
        ]);
        filesData = filesRes.data;
        foldersData = foldersRes.data;
      }

      setFiles(filesData);
      setFolders(foldersData);
      fetchUser();
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, type, fetchUser]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const triggerDeleteFile = (file) => {
    setDeleteModal({
      isOpen: true,
      id: file._id || file.id,
      name: file.name,
      type: 'file'
    });
  };

  const triggerDeleteFolder = (folder) => {
    setDeleteModal({
      isOpen: true,
      id: folder._id || folder.id,
      name: folder.name,
      type: 'folder'
    });
  };

  const triggerBulkDelete = () => {
    setDeleteModal({
      isOpen: true,
      id: null,
      name: `${selectedFiles.length} file(s)`,
      type: 'bulk'
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'file') {
        const fileId = deleteModal.id;
        await api.delete(`/files/trash/${fileId}`);
        setFiles(prevFiles => prevFiles.filter(f => String(f._id || f.id) !== String(fileId)));
        refreshAnalytics();
      } else if (deleteModal.type === 'folder') {
        const folderId = deleteModal.id;
        await api.delete(`/folders/${folderId}`);
        setFolders(prevFolders => prevFolders.filter(f => String(f._id || f.id) !== String(folderId)));
        refreshAnalytics();
      } else if (deleteModal.type === 'bulk') {
        await api.delete('/files/bulk', { data: { fileIds: selectedFiles } });
        const deletedIds = selectedFiles.map(String);
        setFiles(prevFiles => prevFiles.filter(f => !deletedIds.includes(String(f._id || f.id))));
        setSelectedFiles([]);
        refreshAnalytics();
      }
      setDeleteModal({ isOpen: false, id: null, name: '', type: null });
    } catch (error) {
      console.error('Error during deletion:', error);
      alert(error.response?.data?.message || 'Deletion failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareFile = (fileId) => {
    const file = files.find(f => String(f._id || f.id) === String(fileId));
    if (file) {
      setSharingFile(file);
    }
  };

  const handleCutFiles = () => {
    if (selectedFiles.length > 0) {
      const selectedFileObjects = files.filter(f => selectedFiles.map(String).includes(String(f._id || f.id)));
      setClipboard({ operation: 'cut', type: 'file', items: selectedFileObjects });
      setSelectedFiles([]);
    }
  };

  const handleCopyFiles = () => {
    if (selectedFiles.length > 0) {
      const selectedFileObjects = files.filter(f => selectedFiles.map(String).includes(String(f._id || f.id)));
      setClipboard({ operation: 'copy', type: 'file', items: selectedFileObjects });
      setSelectedFiles([]);
    }
  };

  const handlePasteItems = async () => {
    if (clipboard.items.length === 0) return;

    try {
      for (const item of clipboard.items) {
        if (clipboard.type === 'file') {
          if (clipboard.operation === 'cut') {
            await api.put(`/files/${(item._id || item.id)}/move`, { folderId: currentFolderId === 'root' ? null : currentFolderId });
          } else if (clipboard.operation === 'copy') {
            alert('File copying is not implemented yet. Use cut and paste to move files.');
            return;
          }
        } else if (clipboard.type === 'folder') {
          if (clipboard.operation === 'cut') {
            await api.put(`/folders/${(item._id || item.id)}`, { parentId: currentFolderId === 'root' ? null : currentFolderId });
          } else if (clipboard.operation === 'copy') {
            alert('Folder copying is not implemented yet. Use cut and paste to move folders.');
            return;
          }
        }
      }
      
      setClipboard({ operation: null, type: null, items: [] });
      fetchContents();
    } catch (error) {
      console.error('Error pasting items:', error);
      alert('Error moving items. Please try again.');
    }
  };

  const handleShareSelectedFiles = () => {
    if (selectedFiles.length === 1) {
      handleShareFile(selectedFiles[0]);
    } else if (selectedFiles.length > 1) {
      alert('Please select only one file to share at a time.');
    }
  };

  const handleRenameFile = async (fileId) => {
    try {
      await api.put(`/files/${fileId}`, { name: newName });
      setFiles(files.map(f => String(f._id || f.id) === String(fileId) ? { ...f, name: newName } : f));
      setRenameMode(null);
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleRenameFolder = async (folderId) => {
    try {
      await api.put(`/folders/${folderId}`, { name: newName });
      setFolders(folders.map(f => String(f._id || f.id) === String(folderId) ? { ...f, name: newName } : f));
      setRenameMode(null);
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const toggleFileSelection = (fileId) => {
    const sId = String(fileId);
    setSelectedFiles(prev => 
      prev.map(String).includes(sId) 
        ? prev.filter(id => String(id) !== sId)
        : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => (f._id || f.id)));
    }
  };

  const getIconComponent = (type, mimeType) => {
    if (type === 'folder') return Folder;
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

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'size') {
      comparison = a.size - b.size;
    } else if (sortBy === 'date') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {type ? (
              {
                video: 'Videos',
                image: 'Pictures',
                audio: 'Music',
                document: 'Documents',
                folder: 'Folders',
                file: 'Files'
              }[type] || 'Filtered Files'
            ) : currentFolderId === 'root' ? 'Browser Files' : 'Folder'}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {files.length + folders.length} items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedFiles.length > 0 && (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={triggerBulkDelete}
                disabled={isDeleting}
                className="btn bg-error-light dark:bg-error-dark text-white flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete ({selectedFiles.length})
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleCutFiles}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                Cut ({selectedFiles.length})
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleCopyFiles}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy ({selectedFiles.length})
              </motion.button>

              {selectedFiles.length === 1 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleShareSelectedFiles}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </motion.button>
              )}
            </>
          )}

          {clipboard.items.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handlePasteItems}
              className="btn btn-primary flex items-center gap-2"
            >
              <Clipboard className="w-4 h-4" />
              Paste ({clipboard.items.length})
            </motion.button>
          )}
          
          <button
            onClick={() => setShowNewFolder(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <FileUpload onUploadComplete={fetchContents} folderId={currentFolderId} />
        </div>
      </div>

      <div className="card p-4">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Folder className="w-6 h-6 text-primary" />
            {type ? (
              {
                video: 'Videos',
                image: 'Pictures',
                audio: 'Music',
                document: 'Documents',
                folder: 'Folders',
                file: 'Files'
              }[type] || 'Filtered Files'
            ) : 'Browser Files'}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {files.length + folders.length} items
          </p>
        </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-2 px-3 text-sm w-auto"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-apple-md hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              ) : (
                <SortDesc className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              )}
            </button>
            <div className="flex items-center border border-border-light dark:border-border-dark rounded-apple-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : ''} rounded-l-apple-md`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : ''} rounded-r-apple-md`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : files.length === 0 && folders.length === 0 ? (
        <div className="text-center py-20 card">
          <Folder className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            This folder is empty
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Upload files or create folders to get started
          </p>
          <div className="flex items-center justify-center gap-3">
            <FileUpload onUploadComplete={fetchContents} />
            <button
              onClick={() => setShowNewFolder(true)}
              className="btn btn-secondary"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <>
              {sortedFolders.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    Folders
                  </h2>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    {sortedFolders.map((folder, index) => (
                      <motion.div
                        key={(folder._id || folder.id)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="card p-4 group relative"
                      >
                        {renameMode === (folder._id || folder.id) ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="input py-1 text-sm"
                              autoFocus
                            />
                            <button onClick={() => handleRenameFolder((folder._id || folder.id))} className="text-success-light">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRenameMode(null)} className="text-error-light">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/files/${(folder._id || folder.id)}`)}
                              className="w-full text-left"
                            >
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-apple-md flex items-center justify-center mb-3">
                                <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                                {folder.name}
                              </p>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem({ type: 'folder', id: (folder._id || folder.id), data: folder });
                              }}
                              className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                              <MoreVertical className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                            </button>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {sortedFiles.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    Files
                  </h2>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    {sortedFiles.map((file, index) => {
                      const IconComponent = getIconComponent('file', file.mimeType);
                      const isSelected = selectedFiles.map(String).includes(String(file._id || file.id));
                      return (
                        <motion.div
                          key={(file._id || file.id)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (sortedFolders.length * 0.05) + (index * 0.05) }}
                          className={`card p-4 group relative ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        >
                          {renameMode === (file._id || file.id) ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="input py-1 text-sm"
                                autoFocus
                              />
                              <button onClick={() => handleRenameFile((file._id || file.id))} className="text-success-light">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setRenameMode(null)} className="text-error-light">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFileSelection((file._id || file.id));
                                }}
                                className={`absolute top-2 left-2 p-1 rounded z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-primary" />
                                ) : (
                                  <Square className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
                                )}
                              </button>
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="w-full text-left"
                              >
                                <div className={`file-icon ${getFileColor(file.mimeType)} mb-3 overflow-hidden`}>
                                  {file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/') ? (
                                    <img src={getThumbnailUrl(file.cloudinaryUrl, file.mimeType)} alt={file.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <IconComponent className="w-6 h-6" />
                                  )}
                                </div>
                                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                  {formatFileSize(file.size)}
                                </p>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem({ type: 'file', id: (file._id || file.id), data: file });
                                }}
                                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                              >
                                <MoreVertical className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                              </button>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Microsoft File Explorer Details view */
            <div className="overflow-hidden border border-border-light/30 dark:border-border-dark/30 rounded-apple-lg bg-surface-light dark:bg-surface-dark shadow-apple-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border-light/40 dark:border-border-dark/40 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase bg-gray-50/50 dark:bg-black/10">
                      <th className="py-3 px-4 w-12 text-center">
                        <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                          {selectedFiles.length === files.length && files.length > 0 ? (
                            <CheckSquare className="w-4.5 h-4.5 text-primary" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-text-secondary-light dark:text-text-secondary-dark" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4 font-semibold text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 font-semibold text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider">Date modified</th>
                      <th className="py-3 px-4 font-semibold text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 font-semibold text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider">Size</th>
                      <th className="py-3 px-4 w-16 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/20 dark:divide-border-dark/20">
                    {/* Folders List */}
                    {sortedFolders.map((folder, index) => (
                      <motion.tr
                        key={(folder._id || folder.id)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors align-middle"
                      >
                        <td className="py-3.5 px-4 text-center">
                          <div className="w-4 h-4 mx-auto" />
                        </td>
                        
                        <td className="py-3.5 px-4 font-medium text-text-primary-light dark:text-text-primary-dark">
                          {renameMode === (folder._id || folder.id) ? (
                            <div className="flex items-center gap-2 max-w-xs" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="input py-1 px-2 text-sm w-full"
                                autoFocus
                              />
                              <button onClick={() => handleRenameFolder((folder._id || folder.id))} className="text-success-light p-1 rounded hover:bg-success-light/10">
                                <Check className="w-4.5 h-4.5" />
                              </button>
                              <button onClick={() => setRenameMode(null)} className="text-error-light p-1 rounded hover:bg-error-light/10">
                                <X className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => navigate(`/files/${(folder._id || folder.id)}`)}
                              className="flex items-center gap-3 hover:text-primary transition-colors text-left"
                            >
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                <Folder className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="truncate max-w-[280px] text-sm font-semibold">{folder.name}</span>
                            </button>
                          )}
                        </td>
                        
                        <td className="py-3.5 px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          {formatDate(folder.createdAt)}
                        </td>
                        
                        <td className="py-3.5 px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          File Folder
                        </td>
                        
                        <td className="py-3.5 px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          —
                        </td>
                        
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem({ type: 'folder', id: (folder._id || folder.id), data: folder });
                            }}
                            className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}

                    {/* Files List */}
                    {sortedFiles.map((file, index) => {
                      const IconComponent = getIconComponent('file', file.mimeType);
                      const isSelected = selectedFiles.map(String).includes(String(file._id || file.id));
                      return (
                        <motion.tr
                          key={(file._id || file.id)}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (sortedFolders.length * 0.02) + (index * 0.02) }}
                          className={`group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors align-middle ${isSelected ? 'bg-primary/5' : ''}`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFileSelection((file._id || file.id));
                              }}
                              className={`p-1 rounded transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4.5 h-4.5 text-primary" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-text-secondary-light dark:text-text-secondary-dark" />
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-text-primary-light dark:text-text-primary-dark">
                            {renameMode === (file._id || file.id) ? (
                              <div className="flex items-center gap-2 max-w-xs" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  className="input py-1 px-2 text-sm w-full"
                                  autoFocus
                                />
                                <button onClick={() => handleRenameFile((file._id || file.id))} className="text-success-light p-1 rounded hover:bg-success-light/10">
                                  <Check className="w-4.5 h-4.5" />
                                </button>
                                <button onClick={() => setRenameMode(null)} className="text-error-light p-1 rounded hover:bg-error-light/10">
                                  <X className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="flex items-center gap-3 hover:text-primary transition-colors text-left"
                              >
                                <div className={`w-8 h-8 rounded-lg ${getFileColor(file.mimeType)} flex items-center justify-center shrink-0 overflow-hidden`}>
                                  {file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/') ? (
                                    <img src={getThumbnailUrl(file.cloudinaryUrl, file.mimeType)} alt={file.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <IconComponent className="w-4.5 h-4.5" />
                                  )}
                                </div>
                                <span className="truncate max-w-[280px] text-sm font-semibold">{file.name}</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {formatDate(file.createdAt)}
                          </td>

                          <td className="py-3.5 px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {(() => {
                              const mimeType = file.mimeType;
                              const name = file.name;
                              if (!mimeType) {
                                if (name?.toLowerCase().endsWith('.md')) return 'Markdown Note';
                                return 'File';
                              }
                              if (mimeType.startsWith('image/')) {
                                const ext = mimeType.split('/')[1]?.toUpperCase() || 'Image';
                                return `${ext} Image`;
                              }
                              if (mimeType.startsWith('video/')) {
                                const ext = mimeType.split('/')[1]?.toUpperCase() || 'Video';
                                return `${ext} Video`;
                              }
                              if (mimeType.startsWith('audio/')) {
                                const ext = mimeType.split('/')[1]?.toUpperCase() || 'Audio';
                                return `${ext} Audio`;
                              }
                              if (mimeType.includes('pdf')) return 'PDF Document';
                              if (mimeType.includes('word') || mimeType.includes('document') || name?.toLowerCase().endsWith('.docx') || name?.toLowerCase().endsWith('.doc')) return 'Word Document';
                              if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('spreadsheet') || name?.toLowerCase().endsWith('.xlsx') || name?.toLowerCase().endsWith('.csv')) return 'Excel Spreadsheet';
                              if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || name?.toLowerCase().endsWith('.pptx')) return 'PowerPoint Presentation';
                              if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('archive') || mimeType.includes('gz') || name?.toLowerCase().endsWith('.zip')) return 'Compressed Archive';
                              if (mimeType.startsWith('text/') || name?.toLowerCase().endsWith('.txt')) return 'Text Document';
                              if (mimeType === 'text/markdown' || name?.toLowerCase().endsWith('.md')) return 'Markdown Note';
                              return 'File';
                            })()}
                          </td>

                          <td className="py-3.5 px-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {formatFileSize(file.size)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem({ type: 'file', id: (file._id || file.id), data: file });
                              }}
                              className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-all"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-lg shadow-apple-lg p-4 w-48"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'file' && (
                <>
                  <button
                    onClick={() => { setPreviewFile(selectedItem.data); setSelectedItem(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      setPropertiesItem({ item: selectedItem.data, type: 'file' });
                      setSelectedItem(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Info className="w-4 h-4" />
                    Properties
                  </button>
                  <button
                    onClick={() => { setRenameMode(selectedItem.id); setNewName(selectedItem.data.name); setSelectedItem(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Pencil className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => { window.open(selectedItem.data.cloudinaryUrl, '_blank'); setSelectedItem(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => { handleShareFile(selectedItem.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <hr className="my-2 border-border-light dark:border-border-dark" />
                </>
              )}
              {selectedItem.type === 'folder' && (
                <>
                  <button
                    onClick={() => {
                      setPropertiesItem({ item: selectedItem.data, type: 'folder' });
                      setSelectedItem(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Info className="w-4 h-4" />
                    Properties
                  </button>
                  <button
                    onClick={() => { setRenameMode(selectedItem.id); setNewName(selectedItem.data.name); setSelectedItem(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Pencil className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setClipboard({ operation: 'cut', type: 'folder', items: [selectedItem.data] });
                      setSelectedItem(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Scissors className="w-4 h-4" />
                    Cut
                  </button>
                  <button
                    onClick={() => {
                      setClipboard({ operation: 'copy', type: 'folder', items: [selectedItem.data] });
                      setSelectedItem(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <hr className="my-2 border-border-light dark:border-border-dark" />
                </>
              )}
              <button
                onClick={() => {
                  if (selectedItem.type === 'file') {
                    triggerDeleteFile(selectedItem.data);
                  } else {
                    triggerDeleteFolder(selectedItem.data);
                  }
                  setSelectedItem(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left text-error-light dark:text-error-dark"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {showNewFolder && (
        <NewFolderModal
          parentId={currentFolderId === 'root' ? null : currentFolderId}
          onClose={() => setShowNewFolder(false)}
          onSuccess={() => {
            setShowNewFolder(false);
            fetchContents();
          }}
        />
      )}
 
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
 
      {sharingFile && (
        <ShareModal
          file={sharingFile}
          onClose={() => setSharingFile(null)}
        />
      )}
 
      <AnimatePresence>
        {propertiesItem && (
          <PropertiesModal
            item={propertiesItem.item}
            type={propertiesItem.type}
            onClose={() => setPropertiesItem(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', type: null })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.type === 'bulk' ? 'Move Selected Items to Trash?' : 'Move to Trash?'}
        message={
          deleteModal.type === 'folder'
            ? `Are you sure you want to move the folder "${deleteModal.name}" and all of its contents to the trash?`
            : `Are you sure you want to move "${deleteModal.name}" to the trash?`
        }
        confirmText="Move to Trash"
        isProcessing={isDeleting}
      />
    </div>
  );
}