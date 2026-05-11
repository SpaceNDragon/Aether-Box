import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File } from 'lucide-react';
import api from '../../services/api';
import { useStorage } from '../../context/StorageContext';

export default function FileUpload({ onUploadComplete, compact = false, folderId = null }) {
  const { refreshAnalytics } = useStorage();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // 1. Check for duplicates
      for (const file of acceptedFiles) {
        const { data: duplicate } = await api.get('/files/duplicate', {
          params: { name: file.name, folderId }
        });

        if (duplicate.isDuplicate) {
          throw new Error(`File "${file.name}" already exists in this folder.`);
        }
      }

      // 2. Proceed with upload
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add folderId to the form data
      if (folderId && folderId !== 'root') {
        formData.append('folderId', folderId);
      }

      const response = await api.post('/files/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      onUploadComplete();
      refreshAnalytics();
      setProgress(100);
      setTimeout(() => setUploading(false), 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message);
      setUploading(false);
    }
  }, [onUploadComplete, folderId, refreshAnalytics]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  if (compact) {
    return (
      <div className="relative">
        {uploading ? (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-apple-md">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-primary">Uploading {progress}%</span>
          </div>
        ) : (
          <button
            {...getRootProps()}
            className="btn btn-primary flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Files
            <input {...getInputProps()} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-apple-lg p-8 text-center transition-all cursor-pointer ${
          isDragActive || dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border-light dark:border-border-dark hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
        <p className="text-text-primary-light dark:text-text-primary-dark font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            or click to browse
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-error-light/10 text-error-light dark:text-error-dark text-sm rounded-apple-md"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-surface-light dark:bg-surface-dark rounded-apple-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  Uploading...
                </span>
                <span className="text-sm text-primary">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
}