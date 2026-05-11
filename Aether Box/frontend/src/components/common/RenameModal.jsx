import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, X, AlertCircle } from 'lucide-react';

export default function RenameModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Rename Note',
  currentName,
  isProcessing = false
}) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentName) {
      setNewName(currentName);
      setError('');
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (newName.trim() === currentName) {
      onClose();
      return;
    }
    onConfirm(newName.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-md overflow-hidden bg-surface-elevated-light/90 dark:bg-surface-elevated-dark/90 border border-border-light/40 dark:border-border-dark/40 rounded-apple-xl shadow-apple-lg glass z-10 relative"
          >
            {/* Top Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleSubmit}>
              {/* Header / Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full shrink-0 bg-primary/10 text-primary dark:bg-primary/20">
                    <Pencil className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 flex-1 pr-6">
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                      {title}
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                      Enter a new name for your note.
                    </p>

                    <div className="mt-4">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setError('');
                        }}
                        className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/5 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                        placeholder="Note name"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-200 dark:border-red-800 mt-3">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 border-t border-border-light/20 dark:border-border-dark/20 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-black/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="btn btn-secondary text-sm font-medium px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-primary text-sm font-semibold px-5 py-2.5 flex items-center gap-2"
                >
                  {isProcessing && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Rename
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
