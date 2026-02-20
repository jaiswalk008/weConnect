import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number | string;
  nodeEnv: string;
  jwtSecret: string;
  jwtAccessExpiresIn: '1d' | '4h';
  jwtRefreshExpiresIn: '7d' | '30d';
  aiServiceUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  frontendUrl: string;
  agoraAppId: string;
  agoraAppCertificate: string;
}

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtAccessExpiresIn: process.env.NODE_ENV === 'development' ? '1d' : '4h',
  jwtRefreshExpiresIn: process.env.NODE_ENV === 'development' ? '7d' : '30d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  agoraAppId: process.env.AGORA_APP_ID || '',
  agoraAppCertificate: process.env.AGORA_APP_CERTIFICATE || '',
} as Config;
