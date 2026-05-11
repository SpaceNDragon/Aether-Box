import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader, Camera, Shield, HardDrive, Info, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../utils/formatters';
import api from '../services/api';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const storagePercent = user ? (user.storageUsed / user.storageLimit) * 100 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const { data } = await api.put('/auth/profile', { name });
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updateUser(data);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(error.response?.data?.message || 'Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setResetError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters');
      return;
    }

    setResetLoading(true);
    try {
      await api.put('/auth/reset-password', {
        currentPassword,
        newPassword
      });
      setResetSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowResetPassword(false);
        setResetSuccess('');
      }, 3000);
    } catch (error) {
      setResetError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Settings
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Manage your account settings and preferences
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </h2>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
            >
              {uploadingAvatar ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
              Profile Photo
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input pl-11 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60"
              />
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Email cannot be changed
            </p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-success-light/10 text-success-light dark:text-success-dark text-sm rounded-apple-md"
            >
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </form>
      </motion.div>



      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security
        </h2>

        <div className="space-y-3">
          <button 
            onClick={async () => {
              try {
                const { data } = await api.post('/auth/toggle-2fa', { enabled: !user?.isTwoFactorEnabled });
                updateUser(data);
              } catch (error) {
                console.error('Error toggling 2FA:', error);
                alert('Failed to toggle 2FA');
              }
            }}
            className={`w-full flex items-center justify-between p-3 rounded-apple-md border transition-colors ${user?.isTwoFactorEnabled ? 'border-primary bg-primary/5' : 'border-border-light dark:border-border-dark hover:border-primary'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-apple-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{user?.isTwoFactorEnabled ? 'Enabled' : 'Not enabled'}</p>
              </div>
            </div>
            <span className={`text-sm ${user?.isTwoFactorEnabled ? 'text-text-secondary-light dark:text-text-secondary-dark' : 'text-primary'}`}>
              {user?.isTwoFactorEnabled ? 'Disable' : 'Enable'}
            </span>
          </button>

          <button 
            onClick={() => setShowResetPassword(!showResetPassword)}
            className="w-full flex items-center justify-between p-3 rounded-apple-md border border-border-light dark:border-border-dark hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-apple-md flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Reset Password</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Change your account password</p>
              </div>
            </div>
            <span className="text-sm text-primary">
              {showResetPassword ? 'Cancel' : 'Change'}
            </span>
          </button>

          {showResetPassword && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleResetPassword}
              className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-apple-md border border-border-light dark:border-border-dark"
            >
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Confirm new password"
                />
              </div>

              {resetError && (
                <p className="text-sm text-error-light dark:text-error-dark">{resetError}</p>
              )}

              {resetSuccess && (
                <p className="text-sm text-success-light dark:text-success-dark">{resetSuccess}</p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Update Password
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About
        </h2>

        <div className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <p><strong className="text-text-primary-light dark:text-text-primary-dark">Aether Box</strong> - Online File Management System</p>
          <p>Version 1.0.0</p>
          <div className="pt-2 border-t border-border-light dark:border-border-dark">
            <p className="font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Meet the Team</p>
            <ul className="space-y-1 text-xs">
              <li>Nimesh Apte</li>
              <li>Tanisha Kamdar</li>
              <li>Yash Tandon</li>
            </ul>
          </div>
          <p className="pt-2 text-xs">© 2026 NioStar Company. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}