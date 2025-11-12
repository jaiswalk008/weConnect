import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../config/logger';

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction, // Prefix with underscore to indicate intentionally unused
) => {
  // Log the full error for debugging
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
  });

  // Prepare the response object
  const response: any = {
    success: false,
    status: 'error',
    message: err.message,
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack.split('\n').map((line) => line.trim());
  }

  // Handle AppError instances with custom status codes
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(response);
  }

  // Handle other errors
  response.message = 'Internal server error';
  return res.status(500).json(response);
};
