import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
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
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareLink: {
    type: String,
    default: null
  },
  shareLinkExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

fileSchema.index({ userId: 1, folderId: 1 });
fileSchema.index({ userId: 1, name: 'text' });

export default mongoose.model('File', fileSchema);