import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Link, Clock, Check, Mail, Share2, QrCode } from 'lucide-react';
import api from '../../services/api';

export default function ShareModal({ file, onClose }) {
  const [shareLink, setShareLink] = useState(null);
  const [expiry, setExpiry] = useState('7');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');
    try {
      const expiryDays = expiry === 'never' ? null : parseInt(expiry);
      const { data } = await api.post(`/files/${file._id}/share`, { expiryDays });
      setShareLink(data.shareLink);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Shared file: ${file.name}`);
    const body = encodeURIComponent(`Check out this file: ${shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-xl shadow-apple-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share File
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!shareLink ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  Link Expiration
                </label>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="input"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="never">Never expire</option>
                </select>
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Link className="w-4 h-4" />
                )}
                Generate Share Link
              </button>

              {error && (
                <p className="text-sm text-error-light dark:text-error-dark">{error}</p>
              )}
            </>
          ) : (
            <>
              <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-apple-md">
                <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 block">
                  Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="input flex-1 text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className={`btn ${copied ? 'btn-primary' : 'btn-secondary'} px-3`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-success-light dark:text-success-dark mt-2">
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleEmailShare}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(shareLink);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  }}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Facebook
                </button>
              </div>

              <button
                onClick={() => setShareLink(null)}
                className="w-full text-sm text-primary hover:underline"
              >
                Generate new link
              </button>
            </>
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <Clock className="w-4 h-4" />
            <span>
              {expiry === 'never' 
                ? 'Link never expires' 
                : `Link expires in ${expiry} day${expiry !== '1' ? 's' : ''}`}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}