import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
import logger from '@/lib/logger';

interface UploadResult {
  key: string;
  publicUrl: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. Get presigned URL
      const { data } = await axiosInstance.post('/api/storage/upload-url', {
        contentType: file.type,
        fileName: file.name,
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to get upload URL');
      }

      const { uploadUrl, key, publicUrl } = data;

      console.log('Uploading directly to S3 URL:', uploadUrl);
      console.log('Content-Type:', file.type);

      // 2. Upload to S3
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log('S3 Upload successful');
      return { key, publicUrl };
    } catch (err: any) {
      logger.error('error in uploading file', error);
      setError(err.message || 'Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
};
