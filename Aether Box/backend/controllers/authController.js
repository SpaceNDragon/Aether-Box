import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = User.create({
      email,
      password: hashedPassword,
      name,
      storageUsed: 0,
      storageLimit: 26843545600
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        _id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      console.log('Login failed - password mismatch');
      console.log('Input password:', password);
      console.log('Stored password starts with:', user.password.substring(0, 10));
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        _id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = User.update(req.user._id, { name, avatar });

    res.json({
      _id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = User.update(req.user._id, { avatar: req.file.path });

    res.json({
      _id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Reset password for user ID:', req.user._id);
    console.log('Current stored password:', user.password);

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = user.password === currentPassword;
    }

    console.log('Password verification result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('Updating password to:', hashedPassword);

    const updatedUser = User.updatePassword(req.user._id, hashedPassword);

    console.log('Updated user password:', updatedUser.password);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};