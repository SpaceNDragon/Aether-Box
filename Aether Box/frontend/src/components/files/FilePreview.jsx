import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, FileText, Image as ImageIcon, Video, Music, File } from 'lucide-react';
import { formatFileSize, formatDateTime, getFileIcon, getFileColor } from '../../utils/formatters';
import api from '../../services/api';
import ShareModal from './ShareModal';

export default function FilePreview({ file, onClose }) {
  const [isImage] = useState(file.mimeType?.startsWith('image/'));
  const [isVideo] = useState(file.mimeType?.startsWith('video/'));
  const [isAudio] = useState(file.mimeType?.startsWith('audio/'));
  const [isPdf] = useState(file.mimeType?.includes('pdf'));
  const [isDocument] = useState(
    file.mimeType?.includes('document') ||
    file.mimeType?.includes('msword') ||
    file.mimeType?.includes('officedocument') ||
    file.mimeType?.includes('rtf') ||
    file.name?.endsWith('.doc') ||
    file.name?.endsWith('.docx')
  );
  const [showShare, setShowShare] = useState(false);

  const handleDownload = () => {
    window.open(file.cloudinaryUrl, '_blank');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-xl shadow-apple-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              <div className={`file-icon ${getFileColor(file.mimeType)}`}>
                {isImage ? <ImageIcon className="w-6 h-6" /> :
                 isVideo ? <Video className="w-6 h-6" /> :
                 isAudio ? <Music className="w-6 h-6" /> :
                 isPdf ? <FileText className="w-6 h-6" /> :
                 isDocument ? <FileText className="w-6 h-6" /> :
                 <FileText className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {file.name}
                </h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {formatFileSize(file.size)} • {formatDateTime(file.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="p-2 rounded-apple-md hover:bg-gray-100 dark:hover:bg-white/5"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-apple-md hover:bg-gray-100 dark:hover:bg-white/5"
                title="Download"
              >
                <Download className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-apple-md hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
            </div>
          </div>

      <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
        {isImage && (
          <img
            src={file.cloudinaryUrl}
            alt={file.name}
            className="max-w-full h-auto rounded-apple-md mx-auto"
          />
        )}

        {isVideo && (
          <video
            src={file.cloudinaryUrl}
            controls
            className="max-w-full rounded-apple-md mx-auto"
          >
            Your browser does not support video playback.
          </video>
        )}

        {isAudio && (
          <div className="text-center py-8">
            <Music className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
            <audio
              src={file.cloudinaryUrl}
              controls
              className="w-full max-w-md"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {isPdf && (
          <iframe
            src={file.cloudinaryUrl}
            title={file.name}
            className="w-full h-[70vh] rounded-apple-md border-0 bg-white"
          />
        )}

        {isDocument && (
          <div className="w-full h-[70vh] relative rounded-apple-md overflow-hidden bg-white">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(file.cloudinaryUrl)}&embedded=true`}
              title={file.name}
              className="w-full h-full border-0"
              onLoad={(e) => { e.target.style.background = 'white'; }}
            />
          </div>
        )}

        {(file.mimeType?.includes('text') || file.mimeType?.includes('csv') || file.name?.endsWith('.txt')) && (
          <iframe
            src={file.cloudinaryUrl}
            title={file.name}
            className="w-full h-[70vh] rounded-apple-md border-0 bg-white"
          />
        )}

          {!isImage && !isVideo && !isAudio && !isPdf && !isDocument && !file.mimeType?.includes('text') && !file.mimeType?.includes('csv') && (
            <div className="text-center py-12">
              <File className="w-20 h-20 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                Preview not available for this file type
              </p>
              <button
                onClick={handleDownload}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </button>
            </div>
          )}
        </div>
      </motion.div>
      </motion.div>
    </>
  );
}