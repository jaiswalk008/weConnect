"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileSchema = exports.updatePasswordSchema = exports.loginUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).max(100),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
    }),
});
exports.loginUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
    }),
});
exports.updatePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    }),
});
exports.getUserProfileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'User ID is required'),
    }),
});
