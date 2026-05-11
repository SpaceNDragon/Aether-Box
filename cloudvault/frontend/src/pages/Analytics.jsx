import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatFileSize } from '../utils/formatters';
import { HardDrive, FileText, Image, Video, Music, Archive } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';

const COLORS = ['#10b981', '#f43f5e', '#eab308', '#3b82f6', '#8b5cf6'];

export default function Analytics() {
  const { user } = useAuth();
  const { storageAnalytics, loading, refreshAnalytics } = useStorage();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading insights...</div>;
  }

  const chartData = [
    { name: 'Images', value: storageAnalytics.image.size, count: storageAnalytics.image.count, icon: Image },
    { name: 'Videos', value: storageAnalytics.video.size, count: storageAnalytics.video.count, icon: Video },
    { name: 'Music', value: storageAnalytics.audio.size, count: storageAnalytics.audio.count, icon: Music },
    { name: 'Documents', value: storageAnalytics.document.size, count: storageAnalytics.document.count, icon: FileText },
    { name: 'Other', value: storageAnalytics.other.size, count: storageAnalytics.other.count, icon: Archive }
  ].filter(item => item.value > 0);

  const totalSize = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const storagePercent = user ? (totalSize / user.storageLimit) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Storage Insights
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
          Analyze what's taking up your space and manage large files.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 border border-border-light dark:border-border-dark"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
            <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Total Storage Used
            </span>
          </div>
          <span className="text-sm font-medium text-primary">{storagePercent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar mb-2">
          <div className="progress-bar-fill" style={{ width: `${Math.min(storagePercent, 100)}%` }}></div>
        </div>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {formatFileSize(totalSize)} of {formatFileSize(user?.storageLimit || 0)} used
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border border-border-light dark:border-border-dark flex flex-col items-center justify-center min-h-[400px]"
        >
          <h2 className="text-xl font-semibold mb-6 w-full text-left">Storage Usage</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatFileSize(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
              <HardDrive className="w-16 h-16 mb-4 opacity-50" />
              <p>Your storage is completely empty.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 border border-border-light dark:border-border-dark"
        >
          <h2 className="text-xl font-semibold mb-6">Breakdown</h2>
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, color: COLORS[index % COLORS.length] }}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{item.name}</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{item.count} files</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatFileSize(item.value)}</p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {((item.value / totalSize) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
