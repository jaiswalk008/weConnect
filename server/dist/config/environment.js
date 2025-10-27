"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtAccessExpiresIn: process.env.NODE_ENV === 'development' ? '1d' : '4h',
    jwtRefreshExpiresIn: process.env.NODE_ENV === 'development' ? '7d' : '30d',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
