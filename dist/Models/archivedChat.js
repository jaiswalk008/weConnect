"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util.js/database"));
const ArchivedChat = database_1.default.define('archivedchat', {
    id: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: sequelize_1.default.TEXT,
        allowNull: false
    },
    groupId: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    userId: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    type: {
        type: sequelize_1.default.STRING,
        defaultValue: 'text'
    }
});
exports.default = ArchivedChat;
