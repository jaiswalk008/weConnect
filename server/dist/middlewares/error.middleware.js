"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../config/logger"));
const errorMiddleware = (err, req, res, next) => {
    // Log the full error for debugging
    logger_1.default.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        path: req.path,
        method: req.method,
    });
    // Prepare the response object
    const response = {
        status: 'error',
        message: err.message
    };
    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack.split('\n').map(line => line.trim());
    }
    // Handle AppError instances with custom status codes
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json(response);
    }
    // Handle other errors
    response.message = 'Internal server error';
    return res.status(500).json(response);
};
exports.errorMiddleware = errorMiddleware;
