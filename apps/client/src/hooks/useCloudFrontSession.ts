import { useEffect, useRef } from 'react';
import axiosInstance from '@/utils/axiosInstance';

// Refresh session every 2 hours (minus a buffer)
// CloudFront cookies are valid for 24 hours in our backend implementation (see storage.service.ts),
// but user asked for "max of 2 hours" refresh or session validity.
// Let's stick to the user's request of refreshing cookies.
const REFRESH_INTERVAL = 1.5 * 60 * 60 * 1000; // 1.5 hours

export const useCloudFrontSession = () => {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSession = async () => {
    try {
      await axiosInstance.get('/api/storage/session');
      console.log('CloudFront session refreshed');
    } catch (error) {
      console.error('Failed to refresh CloudFront session:', error);
    }
  };

  useEffect(() => {
    // Initial refresh on mount
    refreshSession();

    // Set up interval
    refreshTimerRef.current = setInterval(refreshSession, REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  return { refreshSession };
};
