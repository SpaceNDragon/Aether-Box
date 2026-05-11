import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Edit3, Plus, X, FileText, Loader2, AlertCircle, Pencil, Trash2, ChevronDown, ChevronUp, Folder } from 'lucide-react';
import api from '../services/api';
import { useStorage } from '../context/StorageContext';
import ConfirmModal from '../components/common/ConfirmModal';
import RenameModal from '../components/common/RenameModal';

export default function Notes() {
  const { refreshAnalytics } = useStorage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [showNotesList, setShowNotesList] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', type: null });
  const [renameModal, setRenameModal] = useState({ isOpen: false, id: null, oldName: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const lines = content.split('\n').length;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    setLineCount(lines);
    setWordCount(words);
  }, [content]);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/files?type=document');
      const mdNotes = res.data.filter(f => f.mimeType === 'text/markdown' || f.name?.endsWith('.md'));
      setNotes(mdNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Please add a title for your note.'); return; }
    if (!content.trim()) { setError('Note content cannot be empty.'); return; }
    setError('');
    setSaving(true);
    try {
      const noteName = `${title.trim()}.md`;
      if (selectedNote) {
        await api.put(`/files/${selectedNote._id || selectedNote.id}`, { name: noteName, content });
      } else {
        await api.post('/files/note', { title: title.trim(), content });
      }
      setSaved(true);
      fetchNotes();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const triggerRename = (note) => {
    setRenameModal({
      isOpen: true,
      id: note._id || note.id,
      oldName: note.name.replace('.md', '')
    });
  };

  const handleConfirmRename = async (newName) => {
    if (!renameModal.id || !newName.trim()) return;
    setSaving(true);
    try {
      await api.put(`/files/${renameModal.id}`, { name: `${newName.trim()}.md` });
      fetchNotes();
      if (selectedNote && String(selectedNote._id || selectedNote.id) === String(renameModal.id)) {
        setTitle(newName.trim());
      }
      setRenameModal({ isOpen: false, id: null, oldName: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename note.');
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = (note) => {
    setDeleteModal({
      isOpen: true,
      id: note._id || note.id,
      name: note.name.replace('.md', ''),
      type: 'note'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setSaving(true);
    try {
      await api.delete(`/files/trash/${deleteModal.id}`);
      fetchNotes();
      refreshAnalytics();
      if (selectedNote && String(selectedNote._id || selectedNote.id) === String(deleteModal.id)) {
        handleNew();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note.');
    } finally {
      setSaving(false);
      setDeleteModal({ isOpen: false, id: null, name: '', type: null });
    }
  };

  const handleNew = () => {
    setTitle('');
    setContent('');
    setPreview(false);
    setError('');
    setSaved(false);
    setSelectedNote(null);
  };

  const handleSelectNote = async (note) => {
    setSelectedNote(note);
    const nameWithoutExt = note.name.replace('.md', '');
    setTitle(nameWithoutExt);
    setNewTitle(nameWithoutExt);
    setContent(`# ${nameWithoutExt}\n\nLoading note content...`);
    setPreview(false);
    try {
      const res = await api.get(`/files/${note._id || note.id}`);
      setContent(res.data.content || '');
    } catch (err) {
      console.error('Error loading note content:', err);
      setContent(`# ${nameWithoutExt}\n\n[Unable to load note content. The note may be corrupted or content is unavailable.]`);
    }
  };

  const MARKDOWN_PLACEHOLDERS = `# My Note Title

## Introduction
Start writing your note here in **Markdown** format.

## Key Points
- Point 1
- Point 2
- Point 3

## Code Snippet
\`\`\`
const hello = "Hello, World!";
console.log(hello);
\`\`\`

> This is a blockquote. It can be used to highlight important information.
`;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Note Editor
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Write and save notes in Markdown format
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNew}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Notes Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark flex flex-col"
        >
          <div
            className="p-3 border-b border-border-light dark:border-border-dark flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
            onClick={() => setShowNotesList(!showNotesList)}
          >
            <h2 className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" />
              Saved Notes ({notes.length})
            </h2>
            {showNotesList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {showNotesList && (
            <div className="flex-1 overflow-y-auto">
              {loadingNotes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-8 px-4">
                  No notes yet.
                </p>
              ) : (
                <div className="p-2 space-y-1">
                  {notes.map(note => (
                    <div
                      key={note._id}
                      className={`group p-2 rounded-lg cursor-pointer transition-all ${
                        String(selectedNote?._id || selectedNote?.id) === String(note._id || note.id)
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => handleSelectNote(note)}
                        >
                          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                            📝 {note.name.replace('.md', '')}
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            {note.size ? `${(note.size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); triggerRename(note); }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10"
                            title="Rename"
                          >
                            <Pencil className="w-3 h-3 text-text-secondary-light" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); triggerDelete(note); }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark mb-4">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-4">
                {/* Title Input */}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <input
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setError(''); }}
                    placeholder="Note Title..."
                    className="bg-transparent border-none text-lg font-semibold text-text-primary-light dark:text-text-primary-dark focus:outline-none w-64"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mode Toggles */}
                <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setPreview(false)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      !preview ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" /> Write
                  </button>
                  <button
                    onClick={() => setPreview(true)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      preview ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-text-secondary-light dark:text-text-secondary-dark'
                    }`}
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                <span>Ln 1, Col 1</span>
                <span>{lineCount} lines</span>
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-3">
                {saved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-green-500 font-medium"
                  >
                    ✓ Saved!
                  </motion.span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2 text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 mb-4"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor / Preview */}
          <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
            {preview ? (
              <div className="p-6 prose dark:prose-invert max-w-none h-full overflow-y-auto">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-text-secondary-light dark:text-text-secondary-dark italic">Nothing to preview.</p>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={MARKDOWN_PLACEHOLDERS}
                className="w-full h-full p-4 bg-transparent text-text-primary-light dark:text-text-primary-dark font-mono text-sm resize-none focus:outline-none leading-6"
                spellCheck="false"
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', type: null })}
        onConfirm={handleConfirmDelete}
        title="Move Note to Trash?"
        message={`Are you sure you want to move the note "${deleteModal.name}" to the Trash? You can restore it anytime within the next 30 days.`}
        confirmText="Move to Trash"
        isProcessing={saving}
      />

      <RenameModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ isOpen: false, id: null, oldName: '' })}
        onConfirm={handleConfirmRename}
        currentName={renameModal.oldName}
        isProcessing={saving}
      />
    </div>
  );
}