"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class UserRepository {
    async createUser(data) {
        try {
            const user = await database_1.default.user.create({
                data,
            });
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async getUser(data) {
        const user = await database_1.default.user.findFirst({
            where: data,
        });
        return user;
    }
    async updateUser(userId, data) {
        const user = await database_1.default.user.update({
            where: { id: userId },
            data,
        });
        return user;
    }
}
exports.default = new UserRepository();
