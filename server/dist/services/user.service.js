"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const user_repository_1 = __importDefault(require("../repository/user.repository"));
const errors_1 = require("../utils/errors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = __importDefault(require("../config/environment"));
class UserService {
    constructor() {
        this.saltRounds = 10;
        // async getUserByGoogleId(googleId: string): Promise<UserInterface | null> {
        //   return await prisma.user.findUnique({
        //     where: { googleId },
        //     include: {
        //       profile: true,
        //     },
        //   });
        // }
    }
    async createUser(data) {
        const existingUser = await database_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new errors_1.ConflictError('User already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, this.saltRounds);
        const user = await user_repository_1.default.createUser(Object.assign(Object.assign({}, data), { password: hashedPassword, username: "", profile_image: "" }));
        return user;
    }
    generateAccessToken(userId) {
        const payload = {
            userId,
        };
        return jsonwebtoken_1.default.sign(payload, environment_1.default.jwtSecret, {
            expiresIn: environment_1.default.jwtAccessExpiresIn,
        });
    }
    generateRefreshToken(userId) {
        const payload = {
            userId,
        };
        return jsonwebtoken_1.default.sign(payload, environment_1.default.jwtSecret, {
            expiresIn: environment_1.default.jwtRefreshExpiresIn,
        });
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, environment_1.default.jwtSecret);
        }
        catch (_a) {
            throw new errors_1.AuthenticationError('Invalid refresh token');
        }
    }
    async login(data) {
        const user = await user_repository_1.default.getUser({ email: data.email });
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new errors_1.AuthenticationError('Invalid password');
        }
        return user;
    }
    async getUserProfile(userId) {
        const user = await user_repository_1.default.getUser({ id: userId });
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        const userProfile = {
            name: user.name,
            email: user.email,
            profile_image: user.profile_image,
            username: user.username
        };
        return userProfile;
    }
    async updateUsername(userId, username) {
        const user = await user_repository_1.default.getUser({ id: userId });
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        const usernameExists = await user_repository_1.default.getUser({ username: username.toLowerCase() });
        if (usernameExists) {
            throw new errors_1.ConflictError('Username already exists');
        }
        const updatedUser = await this.updateUserProfile(userId, { username: username.toLowerCase() });
        return updatedUser;
    }
    async updateProfileImage(userId, profile_image) {
        const user = await user_repository_1.default.getUser({ id: userId });
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        const updatedUser = await this.updateUserProfile(userId, { profile_image });
        return updatedUser;
    }
    async updateUserProfile(userId, data) {
        const updatedUser = await user_repository_1.default.updateUser(userId, data);
        if (!updatedUser) {
            throw new errors_1.AuthenticationError('User not found');
        }
        const userProfile = {
            name: updatedUser.name,
            email: updatedUser.email,
            profile_image: updatedUser.profile_image,
            username: updatedUser.username
        };
        return userProfile;
    }
}
exports.default = new UserService();
