import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Info, Calendar, HardDrive, FileText, Folder, Link2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { formatFileSize, formatDate } from '../../utils/formatters';

export default function PropertiesModal({ item, type, onClose }) {
  const [parentFolderName, setParentFolderName] = useState('Loading...');

  useEffect(() => {
    const fetchParentFolder = async () => {
      const parentId = type === 'file' ? item.folderId : item.parentId;
      if (!parentId || parentId === 'root') {
        setParentFolderName('Root (Home)');
        return;
      }
      try {
        const { data } = await api.get(`/folders/${parentId}`);
        setParentFolderName(data.name || 'Root (Home)');
      } catch (err) {
        setParentFolderName('Unknown Folder');
      }
    };
    fetchParentFolder();
  }, [item, type]);

  const fileExt = type === 'file' ? item.name.split('.').pop().toUpperCase() : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-surface-elevated-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-apple-xl shadow-apple-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Get Info (Properties)
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* General Information Header */}
          <div className="flex items-center gap-4 p-4 rounded-apple-lg bg-gray-50 dark:bg-white/5 border border-border-light dark:border-border-dark">
            <div className={`p-3 rounded-apple-md ${type === 'file' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'}`}>
              {type === 'file' ? <FileText className="w-8 h-8" /> : <Folder className="w-8 h-8" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate animate-fade-in" title={item.name}>
                {item.name}
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                {type === 'file' ? `File Format: .${fileExt}` : 'Folder'}
              </p>
            </div>
          </div>

          {/* Properties List */}
          <div className="space-y-4">
            {/* Format (Files only) */}
            {type === 'file' && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">MIME Type / Format</p>
                  <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mt-0.5">
                    {item.mimeType}
                  </p>
                </div>
              </div>
            )}

            {/* Size (Files only) */}
            {type === 'file' && (
              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">File Size</p>
                  <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mt-0.5">
                    {formatFileSize(item.size)} ({item.size.toLocaleString()} bytes)
                  </p>
                </div>
              </div>
            )}

            {/* Origin (Where the file/folder is located) */}
            <div className="flex items-start gap-3">
              <Folder className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Location (Source)</p>
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mt-0.5">
                  {parentFolderName}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Created / Uploaded Date</p>
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mt-0.5">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>

            {/* Cloudinary Link (Files only) */}
            {type === 'file' && item.cloudinaryUrl && (
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Cloud Storage Endpoint</p>
                  <a
                    href={item.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mt-0.5 overflow-hidden text-ellipsis"
                  >
                    View Source Asset <ExternalLink className="w-3.5 h-3.5 inline-block" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-border-light dark:border-border-dark flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary animate-scale-up"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
