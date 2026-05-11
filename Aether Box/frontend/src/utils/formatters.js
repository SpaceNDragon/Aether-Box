export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFileIcon(mimeType) {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'file-text';
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('rtf')) return 'file-text';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) return 'table';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('archive') || mimeType.includes('gz')) return 'archive';
  return 'file';
}

export function getFileColor(mimeType) {
  if (!mimeType) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  if (mimeType.startsWith('image/')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
  if (mimeType.startsWith('video/')) return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
  if (mimeType.startsWith('audio/')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
  if (mimeType.includes('pdf')) return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('rtf')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('archive') || mimeType.includes('gz')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
  return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
}

export function getThumbnailUrl(url, mimeType) {
  if (!url) return '';
  if (mimeType?.startsWith('image/')) {
    return url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/');
  }
  if (mimeType?.startsWith('video/')) {
    return url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/').replace(/\.[^/.]+$/, '.jpg');
  }
  return url;
}
