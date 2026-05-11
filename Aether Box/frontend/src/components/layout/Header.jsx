import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Folder
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ files: [], folders: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [apiBreadcrumbs, setApiBreadcrumbs] = useState([]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const { data } = await api.get(`/search?q=${query}`);
        setSearchResults(data);
        setShowSearch(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      const paths = location.pathname.split('/').filter(Boolean);
      if (paths[0] === 'files' && paths[1] && paths[1] !== 'root' && !['video', 'image', 'audio', 'document', 'folder', 'file'].includes(paths[1])) {
        try {
          const { data } = await api.get(`/folders/breadcrumb/${paths[1]}`);
          setApiBreadcrumbs(data);
        } catch (error) {
          console.error('Error fetching breadcrumbs:', error);
          setApiBreadcrumbs([]);
        }
      } else {
        setApiBreadcrumbs([]);
      }
    };

    fetchBreadcrumbs();
  }, [location.pathname]);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [];

    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');

    if (paths[0] === 'files') {
      if (paths[1] && apiBreadcrumbs.length > 0) {
        const list = [{ name: 'Browser Files', path: '/files' }];
        apiBreadcrumbs.forEach((crumb) => {
          list.push({
            name: crumb.name,
            path: `/files/${crumb._id || crumb.id}`
          });
        });
        return list;
      }
      if (type === 'video') return [{ name: 'Browser Files', path: '/files' }, { name: 'Videos', path: '/files?type=video' }];
      if (type === 'image') return [{ name: 'Browser Files', path: '/files' }, { name: 'Pictures', path: '/files?type=image' }];
      if (type === 'audio') return [{ name: 'Browser Files', path: '/files' }, { name: 'Music', path: '/files?type=audio' }];
      if (type === 'document') return [{ name: 'Browser Files', path: '/files' }, { name: 'Documents', path: '/files?type=document' }];
      return [{ name: 'Browser Files', path: '/files' }];
    }

    const pageNames = {
      'analytics': 'Storage Insights',
      'network': 'Cloud Storage',
      'notes': 'Note Editor',
      'trash': 'Trash',
      'settings': 'Settings',
      'auth': 'Login'
    };

    if (paths[0] === 'analytics') return [{ name: 'Storage Insights', path: '/analytics' }];
    if (paths[0] === 'network') return [{ name: 'Cloud Storage', path: '/network' }];
    if (paths[0] === 'notes') return [{ name: 'Note Editor', path: '/notes' }];
    if (paths[0] === 'trash') return [{ name: 'Trash', path: '/trash' }];
    if (paths[0] === 'settings') return [{ name: 'Settings', path: '/settings' }];

    return [{ name: pageNames[paths[0]] || paths[0], path: '/' + paths[0] }];
  };

  return (
    <header className="sticky top-0 z-30 glass">
      <div className="grid grid-cols-3 items-center px-6 py-4">
        {/* Left: Navigation Buttons (Go Back / Go Forward) */}
        <div className="flex items-center gap-2 justify-self-start">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark transition-all duration-200 active:scale-90"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark transition-all duration-200 active:scale-90"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Centered Search Bar */}
        <div className="flex justify-center justify-self-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={handleSearch}
            className="input pl-10 w-full"
          />
          <AnimatePresence>
            {showSearch && (searchResults.files.length > 0 || searchResults.folders.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-md shadow-apple-lg border border-border-light dark:border-border-dark max-h-80 overflow-y-auto"
              >
                {searchResults.folders.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2 py-1">Folders</p>
                    {searchResults.folders.map(folder => (
                      <button
                        key={folder._id}
                        onClick={() => {
                          navigate(`/files/${folder._id}`);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                      >
                        <Folder className="w-4 h-4 text-primary" />
                        <span className="text-sm text-text-primary-light dark:text-text-primary-dark">{folder.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.files.length > 0 && (
                  <div className="p-2 border-t border-border-light dark:border-border-dark">
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2 py-1">Files</p>
                    {searchResults.files.map(file => (
                      <button
                        key={file._id}
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                      >
                        <span className="text-sm text-text-primary-light dark:text-text-primary-dark">{file.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Theme Toggle & User Menu */}
        <div className="flex items-center gap-4 justify-self-end">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-apple-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
            ) : (
              <Moon className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-apple-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark hidden md:block">
                {user?.name}
              </span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-apple-md shadow-apple-lg border border-border-light dark:border-border-dark overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
                    <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{user?.name}</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-light dark:text-error-dark hover:bg-gray-100 dark:hover:bg-white/5 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {location.pathname !== '/' && (
        <div className="px-6 pb-3 flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/')} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
            Home
          </button>
          {getBreadcrumbs().map((crumb, index) => (
            <span key={crumb.path} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <button
                onClick={() => navigate(crumb.path)}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}
    </header>
  );
}