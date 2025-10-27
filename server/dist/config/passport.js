"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("./logger"));
const user_repository_1 = __importDefault(require("../repository/user.repository"));
const configurePassport = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
        var _a, _b, _c, _d;
        try {
            const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            if (!email) {
                return done(new Error('No email found in Google profile'));
            }
            const profilePicUrl = ((_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || null;
            let user = await database_1.default.user.findFirst({
                where: {
                    OR: [{ email }, { googleId: profile.id }],
                },
            });
            if (user) {
                if (profilePicUrl && user.profile_image !== profilePicUrl) {
                    user = await database_1.default.user.update({
                        where: { id: user.id },
                        data: {
                            profile_image: profilePicUrl,
                            googleId: profile.id,
                        },
                    });
                }
            }
            else {
                user = await user_repository_1.default.createUser({
                    email,
                    name: profile.displayName || email.split('@')[0] || 'User',
                    password: '',
                    googleId: profile.id,
                    profile_image: profilePicUrl,
                });
            }
            return done(null, user);
        }
        catch (error) {
            logger_1.default.error('Google auth error:', error);
            return done(error);
        }
    }));
    return passport_1.default;
};
exports.default = configurePassport;
