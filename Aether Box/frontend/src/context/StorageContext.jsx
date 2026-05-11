import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const StorageContext = createContext();

export function StorageProvider({ children }) {
  const { fetchUser } = useAuth();
  const [storageAnalytics, setStorageAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStorageAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/files/analytics');
      setStorageAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching storage analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageAnalytics();
  }, [fetchStorageAnalytics]);

  const refreshAnalytics = () => {
    fetchStorageAnalytics();
    fetchUser();
  };

  const totalUsed = storageAnalytics
    ? storageAnalytics.image.size +
      storageAnalytics.video.size +
      storageAnalytics.audio.size +
      storageAnalytics.document.size +
      storageAnalytics.other.size
    : 0;

  return (
    <StorageContext.Provider value={{ storageAnalytics, loading, fetchStorageAnalytics, refreshAnalytics, totalUsed }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
