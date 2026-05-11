import express from 'express';
import { register, login, getMe, updateProfile, uploadAvatar, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/reset-password', protect, resetPassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/toggle-2fa', protect, async (req, res) => {
  try {
    const { enabled } = req.body;
    import('../models/index.js').then(({ User }) => {
      const user = User.update(req.user._id, { isTwoFactorEnabled: enabled });
      res.json({
        _id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;