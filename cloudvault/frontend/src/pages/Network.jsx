import { motion, AnimatePresence } from 'framer-motion';
import { Database, Link as LinkIcon, Check, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Network() {
  const [connecting, setConnecting] = useState(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState({
    'google-drive': false,
    'dropbox': false,
    'onedrive': false,
    'aws-s3': false
  });
  
  useEffect(() => {
    // Check for Google OAuth callback in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        // In a real app, send this to backend. For now, mark as connected
        setConnectedProviders(prev => ({ ...prev, 'google-drive': true }));
        alert('Successfully connected to Google Drive!');
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (hash && hash.includes('error')) {
      alert('Failed to connect to Google Drive. Please check your Client ID configuration.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const handleConnect = (id) => {
    if (id === 'Google Drive') {
      setShowGoogleModal(true);
    } else {
      setConnecting(id);
      setTimeout(() => {
        alert(`${id} integration is coming soon!`);
        setConnecting(null);
      }, 1000);
    }
  };

  const handleGoogleAuth = () => {
    setConnecting('Google Drive');
    
    // In a real application, we would fetch this URL from our backend
    // This directs the user to the actual Google Sign-In page
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
    const redirectUri = "http://localhost:5173/network"; // Assuming frontend dev server
    const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly";
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&include_granted_scopes=true`;
    
    // Redirect to Google
    window.location.href = authUrl;
  };

  const providers = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Connect your Google account to sync files and access your drive documents directly from AetherBox.',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10">
          <path fill="#FFC107" d="M17 5.8L5 26.6l5.8 10L22.8 15.8z"/>
          <path fill="#1976D2" d="M36.8 26.6L25 5.8H13.4l11.8 20.8z"/>
          <path fill="#4CAF50" d="M42.6 36.6L31 15.8 25 26.6l11.8 20.8z"/>
        </svg>
      ),
      connected: connectedProviders['google-drive']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Link your Dropbox account to automatically backup files and share links seamlessly.',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10">
          <path fill="#0061FF" d="M24 14.5l-10-6.4 10-6.4 10 6.4-10 6.4zm0 12.8L14 20.9l-10 6.4 10 6.4 10-6.4zm0 0l10-6.4 10 6.4-10 6.4-10-6.4zM14 36.3l10 6.4 10-6.4-10-6.4-10 6.4z"/>
        </svg>
      ),
      connected: connectedProviders['dropbox']
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      description: 'Access your Microsoft cloud storage files securely within your AetherBox workspace.',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10">
          <path fill="#0078D4" d="M33 17c-2.8 0-5.2 1.6-6.3 4C25.4 20.4 23.8 20 22 20c-3.9 0-7 3.1-7 7 0 .3 0 .6.1.8-3.4.6-6.1 3.6-6.1 7.2 0 4.1 3.3 7.5 7.5 7.5h20c5.2 0 9.5-4.3 9.5-9.5S41.8 23.5 36.5 23.5c-.3 0-.6 0-.8.1C35.2 19.8 34.2 17 33 17z"/>
        </svg>
      ),
      connected: connectedProviders['onedrive']
    },
    {
      id: 'aws-s3',
      name: 'Amazon S3',
      description: 'Enterprise-grade object storage integration for advanced file archiving.',
      icon: (
        <div className="w-10 h-10 bg-[#232F3E] rounded-full flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
      ),
      connected: connectedProviders['aws-s3']
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Cloud Storage
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
            Connect your favorite cloud storage providers to centralize your files.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {providers.map((provider) => (
          <motion.div
            key={provider.id}
            variants={itemVariants}
            className="card p-6 border border-border-light dark:border-border-dark flex flex-col h-full hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-apple-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                  {provider.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                    {provider.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${provider.connected ? 'bg-success-light/10 text-success-light dark:bg-success-dark/10 dark:text-success-dark' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {provider.connected ? <Check className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                      {provider.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 flex-1">
              {provider.description}
            </p>

            <button
              onClick={() => handleConnect(provider.name)}
              disabled={connecting === provider.name}
              className={`w-full btn ${provider.connected ? 'btn-secondary' : 'btn-primary'} flex items-center justify-center gap-2`}
            >
              {connecting === provider.name ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : provider.connected ? (
                'Manage Connection'
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Connect Account
                </>
              )}
            </button>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showGoogleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGoogleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-xl shadow-apple-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 dark:bg-white/5 rounded-apple-2xl flex items-center justify-center">
                  <svg viewBox="0 0 48 48" className="w-12 h-12">
                    <path fill="#FFC107" d="M17 5.8L5 26.6l5.8 10L22.8 15.8z"/>
                    <path fill="#1976D2" d="M36.8 26.6L25 5.8H13.4l11.8 20.8z"/>
                    <path fill="#4CAF50" d="M42.6 36.6L31 15.8 25 26.6l11.8 20.8z"/>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                  Connect Google Drive
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                  AetherBox wants to access your Google Account to view, manage, and sync your drive files seamlessly.
                </p>

                <div className="bg-gray-50 dark:bg-black/20 rounded-apple-lg p-4 mb-8 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success-light dark:text-success-dark shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">See, edit, create, and delete all of your Google Drive files.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success-light dark:text-success-dark shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">View the photos, videos and albums in your Google Photos.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={connecting === 'Google Drive'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGoogleAuth}
                    className="btn btn-primary flex-1"
                    disabled={connecting === 'Google Drive'}
                  >
                    {connecting === 'Google Drive' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authorizing...
                      </span>
                    ) : (
                      'Authorize Access'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
