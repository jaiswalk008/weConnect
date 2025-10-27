"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../middlewares/validate");
const user_validation_1 = require("../validations/user.validation");
const passport_1 = __importDefault(require("passport"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});
router.post("/auth/signup", (0, validate_1.validate)(user_validation_1.createUserSchema), user_controller_1.default.createUser);
router.post("/auth/login", (0, validate_1.validate)(user_validation_1.loginUserSchema), user_controller_1.default.login);
router.get("/me", auth_middleware_1.authenticateToken, user_controller_1.default.getUserProfile);
router.patch("/me/username", auth_middleware_1.authenticateToken, user_controller_1.default.updateUserName);
router.patch("/me/profile-image", auth_middleware_1.authenticateToken, user_controller_1.default.updateProfileImage);
// Protected routes
// router.get('/', isAuthenticated, userController.getAllUsers);
// router.post(
//   '/', 
//   isAuthenticated,
//   validate(createUserSchema),
//   userController.createUser
// );
// router.get(
//   '/profile/:id', 
//   isAuthenticated, 
//   validate(getUserProfileSchema),
//   userController.getUserProfile
// );
// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });
exports.default = router;
