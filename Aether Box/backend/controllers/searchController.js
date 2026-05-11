import { File, Folder } from '../models/index.js';

export const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ files: [], folders: [] });
    }

    const allFiles = File.findAllByUser(req.user._id);
    const allFolders = Folder.findAllByUser(req.user._id);

    const files = allFiles.filter(f => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20);
    const folders = allFolders.filter(f => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 10);

    res.json({ files, folders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};