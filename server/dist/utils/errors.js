"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ForbiddenError = exports.ValidationError = exports.NotFoundError = exports.ConflictError = exports.AuthenticationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class AuthenticationError extends AppError {
    constructor(message = 'Invalid credentials') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
