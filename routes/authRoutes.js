import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";

// General authentication routes
router.get("/", authController.getAuth); // Maybe a landing page or auth status?
router.get("/profile", authController.getProfile); // Protected profile view

// Authentication actions
router.post("/signup", authController.postSignup); // Sign up a new user
router.post("/login", authController.postLogin);   // Login functionality
router.post("/logout", authController.postLogout); // Logout functionality

// Password reset flows
router.post("/forgot-password", authController.postForgotPassword); // Send reset email
router.get("/forgot_password", authController.getForgotPassword);   // Serve forgot password view
router.post("/reset-password", authController.postResetPassword);   // Handle password reset
router.get("/reset_password", authController.getResetPassword);     // Serve reset password form

export default router;
