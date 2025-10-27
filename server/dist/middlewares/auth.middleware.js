"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = __importDefault(require("../config/environment"));
const errors_1 = require("../utils/errors");
const user_repository_1 = __importDefault(require("../repository/user.repository"));
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        next(new errors_1.AppError('Authentication required', 401));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, String(environment_1.default.jwtSecret));
        const user = await user_repository_1.default.getUser({ id: decoded.userId });
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        req.userId = user.id;
        next();
    }
    catch (_a) {
        next(new errors_1.AuthenticationError('Invalid or expired token'));
    }
};
exports.authenticateToken = authenticateToken;
