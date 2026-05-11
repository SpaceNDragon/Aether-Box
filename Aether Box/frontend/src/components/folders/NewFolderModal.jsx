import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, X } from 'lucide-react';
import api from '../../services/api';

export default function NewFolderModal({ parentId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/folders', { name, parentId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-lg shadow-apple-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            New Folder
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="input"
              autoFocus
            />
            {error && (
              <p className="text-sm text-error-light dark:text-error-dark mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Folder'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}