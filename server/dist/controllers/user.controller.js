"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const errors_1 = require("../utils/errors");
class UserController {
    static async createUser(req, res, next) {
        try {
            const { email, name, password } = req.body;
            if (!email || !name || !password) {
                throw new errors_1.ValidationError('Email and name are required');
            }
            const user = await user_service_1.default.createUser({ email, name, password });
            const accessToken = user_service_1.default.generateAccessToken(user.id);
            const refreshToken = user_service_1.default.generateRefreshToken(user.id);
            res.status(201).json({
                status: 'success',
                accessToken,
                refreshToken,
                message: "User created successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new errors_1.ValidationError('Email and password are required');
            }
            const user = await user_service_1.default.login({ email, password });
            const accessToken = user_service_1.default.generateAccessToken(user.id);
            const refreshToken = user_service_1.default.generateRefreshToken(user.id);
            res.status(200).json({
                status: 'success',
                accessToken,
                refreshToken,
                message: "User logged in successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserProfile(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_1.ValidationError('User ID is required');
            }
            const user = await user_service_1.default.getUserProfile(userId);
            res.status(200).json({
                status: 'success',
                user,
                message: "User profile fetched successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUserName(req, res, next) {
        try {
            const userId = req.userId;
            const { username } = req.body;
            if (!userId) {
                throw new errors_1.ValidationError('User ID is required');
            }
            const user = await user_service_1.default.updateUsername(userId, username);
            res.status(200).json({
                status: 'success',
                user,
                message: "User profile updated successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfileImage(req, res, next) {
        try {
            const userId = req.userId;
            const { profile_image } = req.body;
            if (!userId) {
                throw new errors_1.ValidationError('User ID is required');
            }
            const user = await user_service_1.default.updateProfileImage(userId, profile_image);
            res.status(200).json({
                status: 'success',
                user,
                message: "User profile updated successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserController;
