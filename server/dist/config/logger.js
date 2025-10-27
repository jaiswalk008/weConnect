"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = exports.httpLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
// Create Morgan tokens
morgan_1.default.token('body', (req) => JSON.stringify(req.body));
// Create Morgan middleware for different environments
exports.httpLogger = {
    development: (0, morgan_1.default)('dev'),
    production: (0, morgan_1.default)('combined'),
};
// Application logger
/* eslint-disable no-console */
exports.logger = {
    info: (message) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    },
    warn: (message) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    },
    debug: (message) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
        }
    },
    http: (message) => {
        console.log(`[HTTP] ${new Date().toISOString()}: ${message}`);
    },
};
/* eslint-enable no-console */
// Create stream for Morgan
exports.stream = {
    write: (message) => exports.logger.http(message.trim()),
};
exports.default = exports.logger;
