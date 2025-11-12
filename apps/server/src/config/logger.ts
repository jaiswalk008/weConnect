import morgan from 'morgan';
import { Request } from 'express';

// Create Morgan tokens
morgan.token('body', (req: Request) => JSON.stringify(req.body));

// Create Morgan middleware for different environments
export const httpLogger = {
  development: morgan('dev'),
  production: morgan('combined'),
};

// Application logger
export const logger = {
  info: (message: string): void => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  error: (message: string, error?: unknown): void => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  warn: (message: string): void => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  },
  debug: (message: string): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  },
  http: (message: string): void => {
    console.log(`[HTTP] ${new Date().toISOString()}: ${message}`);
  },
};

// Create stream for Morgan
export const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
