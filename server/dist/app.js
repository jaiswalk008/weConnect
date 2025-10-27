"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("./config/logger");
const error_middleware_1 = require("./middlewares/error.middleware");
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
// Session configuration
// Initialize Passport
// const passportInstance = passport();
// app.use(passportInstance.initialize());
// app.use(passportInstance.session());
// Routes
app.use(routes_1.default);
// Error handling middleware
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
