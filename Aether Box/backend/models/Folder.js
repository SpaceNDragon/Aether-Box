import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    default: '/'
  }
}, {
  timestamps: true
});

folderSchema.index({ userId: 1, parentId: 1 });
folderSchema.index({ userId: 1, name: 'text' });

export default mongoose.model('Folder', folderSchema);