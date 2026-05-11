import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Folder,
  Settings,
  Cloud,
  HardDrive,
  Menu,
  Trash2,
  Video,
  Image,
  Music,
  Download,
  Globe,
  FileText,
  TrendingUp,
  NotebookPen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { formatFileSize } from '../../utils/formatters';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/files', icon: Folder, label: 'Browser Files' },
  { path: '/analytics', icon: TrendingUp, label: 'Storage Insights' },
  { path: '/notes', icon: NotebookPen, label: 'Note Editor' },
  { path: '/trash', icon: Trash2, label: 'Trash' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

const quickAccessItems = [
  { path: '/files?type=video', icon: Video,    label: 'Videos',    color: 'text-red-500 dark:text-red-400' },
  { path: '/files?type=image', icon: Image,    label: 'Pictures',  color: 'text-green-500 dark:text-green-400' },
  { path: '/files?type=audio', icon: Music,    label: 'Music',     color: 'text-yellow-500 dark:text-yellow-400' },
  { path: '/files',            icon: FileText, label: 'Documents', color: 'text-blue-500 dark:text-blue-400' },
  { path: '/network',          icon: Cloud,    label: 'Cloud Storage', color: 'text-purple-500 dark:text-purple-400' }
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const { totalUsed } = useStorage();
  const location = useLocation();

  const storagePercent = user ? (totalUsed / user.storageLimit) * 100 : 0;

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 256 : 80
        }}
        className="fixed left-0 top-0 h-screen glass border-r border-border-light/20 dark:border-border-dark/20 z-40 flex flex-col"
      >
        <div className={`p-4 flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-10 h-10 bg-primary rounded-apple-md flex items-center justify-center">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark"
            >
              Aether Box
            </motion.span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-apple-md transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className={`px-5 py-2 ${isOpen ? 'block' : 'hidden'}`}>
            <span className="text-xs font-semibold text-text-secondary-light/70 dark:text-text-secondary-dark/70 uppercase tracking-wider">
              Quick Access
            </span>
          </div>

          <nav className="px-3 pb-4 space-y-1">
            {quickAccessItems.map((item) => {
              if (item.action) {
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-md transition-all duration-150 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </button>
                );
              }
              
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-apple-md transition-all duration-150 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isOpen && (
          <div className="p-4 border-t border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 mb-3">
              <HardDrive className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Storage
              </span>
            </div>
            <div className="progress-bar mb-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {formatFileSize(totalUsed)} of {formatFileSize(user?.storageLimit || 0)} used
            </p>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface-elevated-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-full flex items-center justify-center shadow-apple-sm hover:scale-110 transition-transform"
        >
          <Menu className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
      </motion.aside>
    </>
  );
}