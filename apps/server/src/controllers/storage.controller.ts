import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import storageService from '../services/storage.service';
import logger from '../config/logger';
import { User } from '@prisma/client';

class StorageController {
  async getUploadUrl(req: Request, res: Response) {
    try {
      const { contentType, fileName } = req.body;

      if (!contentType) {
        return res.status(400).json({ success: false, error: 'Content type is required' });
      }

      // Generate a unique key for the file
      const user = req.user as User; // Cast to any to safely access potentially linked user properties
      // Fallback to userId if username is not available (though it should be)
      const userFolder = user.username || user.id;

      // Sanitized filename: replace spaces with hyphens, remove special chars
      const sanitizedFileName = (fileName || uuidv4()).replace(/[^a-zA-Z0-9.-]/g, '-');
      const timestamp = Date.now();

      // Structure: uploads/{username}/{filename}-{timestamp}.{ext}
      // Note: we don't strictly need extension from contentType if fileName is provided,
      // but let's keep it safe.
      const extension = contentType.split('/')[1] || 'bin';

      // If filename has extension, use it, otherwise append
      let finalFileName = sanitizedFileName;
      if (!finalFileName.endsWith(`.${extension}`) && !finalFileName.includes('.')) {
        finalFileName = `${finalFileName}.${extension}`;
      }

      // Insert timestamp before extension
      const lastDotIndex = finalFileName.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        finalFileName = `${finalFileName.substring(0, lastDotIndex)}-${timestamp}${finalFileName.substring(lastDotIndex)}`;
      } else {
        finalFileName = `${finalFileName}-${timestamp}`;
      }

      const key = `uploads/${userFolder}/${finalFileName}`;

      const url = await storageService.getPresignedUploadUrl(key, contentType);

      res.json({
        success: true,
        uploadUrl: url,
        key: key,
        publicUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`,
      });
    } catch (error) {
      logger.error('Error in getUploadUrl:', error);
      res.status(500).json({ success: false, error: 'Failed to generate upload URL' });
    }
  }

  async refreshSession(req: Request, res: Response) {
    try {
      const cookies = storageService.getCloudFrontSignedCookies();

      if (!cookies) {
        // Fallback for dev or missing config
        return res.json({ success: false, message: 'CloudFront signing not configured' });
      }

      // Set cookies
      // The keys are usually 'CloudFront-Key-Pair-Id', 'CloudFront-Policy', 'CloudFront-Signature'
      Object.entries(cookies).forEach(([name, value]) => {
        res.cookie(name, value, {
          domain: process.env.COOKIE_DOMAIN || undefined, // Set domain if needed
          path: '/',
          httpOnly: true,
          secure: true, // Always secure for CloudFront
          sameSite: 'none', // Needed for cross-origin if frontend/backend are different domains
        });
      });

      res.json({ success: true, message: 'Session refreshed' });
    } catch (error) {
      logger.error('Error in refreshSession:', error);
      res.status(500).json({ success: false, error: 'Failed to refresh session' });
    }
  }
}

export default new StorageController();
