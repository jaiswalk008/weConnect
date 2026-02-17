import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  getSignedCookies,
  getSignedUrl as getCloudFrontSignedUrl,
} from '@aws-sdk/cloudfront-signer';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private cloudfrontDomain: string;
  private cloudfrontKeyPairId: string;
  private cloudfrontPrivateKey: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.IAM_ACCESS_KEY || '',
        secretAccessKey: process.env.IAM_SECRET_KEY || '',
      },
      // Disable automatic checksum generation which causes issues with presigned URLs
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';
    this.cloudfrontKeyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || '';

    // Read private key from file
    try {
      const keyPath = path.join(process.cwd(), 'CLOUDFRONT_PRIVATE_KEY.txt');
      this.cloudfrontPrivateKey = fs.readFileSync(keyPath, 'utf-8');
      if (!this.cloudfrontPrivateKey) {
        logger.warn('CLOUDFRONT_PRIVATE_KEY.txt not found and env var not set');
      }
    } catch (error) {
      logger.error('Error reading CloudFront private key:', error);
      this.cloudfrontPrivateKey = '';
    }
  }

  async getPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      logger.error('Error generating presigned upload URL:', error);
      throw error;
    }
  }

  getCloudFrontSignedCookies() {
    if (!this.cloudfrontPrivateKey || !this.cloudfrontKeyPairId || !this.cloudfrontDomain) {
      logger.warn('Missing CloudFront configuration for signed cookies');
      return null;
    }

    try {
      const policy = {
        Statement: [
          {
            Resource: `${this.cloudfrontDomain}/*`,
            Condition: {
              DateLessThan: {
                'AWS:EpochTime': Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      };

      const cookies = getSignedCookies({
        keyPairId: this.cloudfrontKeyPairId,
        privateKey: this.cloudfrontPrivateKey,
        policy: JSON.stringify(policy),
      });

      return cookies;
    } catch (error) {
      logger.error('Error generating CloudFront signed cookies:', error);
      throw error;
    }
  }

  // For development environment fallback
  getSignedUrlForFile(key: string) {
    if (!this.cloudfrontPrivateKey || !this.cloudfrontKeyPairId || !this.cloudfrontDomain) {
      logger.warn('Missing CloudFront configuration for signed URL');
      return null;
    }

    try {
      const url = `${this.cloudfrontDomain}/${key}`;

      const signedUrl = getCloudFrontSignedUrl({
        url,
        keyPairId: this.cloudfrontKeyPairId,
        privateKey: this.cloudfrontPrivateKey,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day expiration
      });

      return signedUrl;
    } catch (error) {
      logger.error('Error generating CloudFront signed URL:', error);
      return null;
    }
  }
}

export default new StorageService();
