import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Upload,
  Clock,
  TrendingUp,
  HardDrive,
  Plus,
  ArrowRight,
  Clipboard,
  Scissors,
  Copy,
  ClipboardPaste,
  User,
  Download,
  Globe,
  Cloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatFileSize, formatDate, getFileIcon, getFileColor, getThumbnailUrl } from '../utils/formatters';
import FileUpload from '../components/files/FileUpload';

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

const statCards = [
  { icon: FileText, label: 'Documents', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', key: 'documents' },
  { icon: Music,    label: 'Music',      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', key: 'music' },
  { icon: Image,    label: 'Pictures',  color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', key: 'pictures' },
  { icon: Video,    label: 'Videos',    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', key: 'videos' }
];

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-apple-md"></div>
      </div>
    </div>
  );
}

function FileCardSkeleton() {
  return (
    <div className="p-4 rounded-apple-md border border-border-light dark:border-border-dark animate-pulse">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-apple-md mb-2"></div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}

export default function Dashboard() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ documents: 0, music: 0, pictures: 0, videos: 0 });
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filesRes, foldersRes] = await Promise.all([
        api.get('/files'),
        api.get('/folders')
      ]);

      const files = filesRes.data;
      const folders = foldersRes.data;

      setStats({
        documents: files.filter(f =>
          f.mimeType?.includes('pdf') || f.mimeType?.includes('document') ||
          f.mimeType?.includes('text') || f.mimeType?.includes('word') ||
          f.mimeType?.includes('sheet') || f.mimeType?.includes('presentation')
        ).length,
        music: files.filter(f => f.mimeType?.startsWith('audio/')).length,
        pictures: files.filter(f => f.mimeType?.startsWith('image/')).length,
        videos: files.filter(f => f.mimeType?.startsWith('video/')).length
      });

      setRecentFiles(files.slice(0, 6));
      fetchUser();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getIconComponent = (mimeType) => {
    const iconName = getFileIcon(mimeType);
    const icons = {
      image: Image,
      video: Video,
      audio: Music,
      archive: Archive,
      file: FileText,
      'file-text': FileText
    };
    const IconComponent = icons[iconName] || FileText;
    return IconComponent;
  };

  const storagePercent = user ? (user.storageUsed / user.storageLimit) * 100 : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Here's what's happening with your files
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <FileUpload onUploadComplete={fetchData} compact />
          <button
            onClick={() => navigate('/files')}
            className="btn btn-secondary flex items-center gap-2"
          >
            Browse Files
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card p-5 cursor-pointer"
              onClick={() => {
                const typeMap = {
                  documents: 'document',
                  music: 'audio',
                  pictures: 'image',
                  videos: 'video'
                };
                navigate(`/files?type=${typeMap[stat.key]}`);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-1">
                    {Object.values(stats)[index]}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-apple-md flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div variants={itemVariants} className="w-full">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Files
              </h2>
              <button
                onClick={() => navigate('/files')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6">
              <FileUpload onUploadComplete={fetchData} />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Array(6).fill(0).map((_, i) => <FileCardSkeleton key={i} />)}
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {recentFiles.map((file, index) => {
                  const IconComponent = getIconComponent(file.mimeType);
                  return (
                    <motion.button
                      key={file._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/files')}
                      className="p-4 rounded-apple-md border border-border-light dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className={`file-icon ${getFileColor(file.mimeType)} mb-2 overflow-hidden`}>
                        {file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/') ? (
                          <img src={getThumbnailUrl(file.cloudinaryUrl, file.mimeType)} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <IconComponent className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {formatFileSize(file.size)}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-3" />
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  No files yet. Upload your first file!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}