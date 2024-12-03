import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";

router.get("/", authController.getAuth);

router.get("/profile", authController.getProfile);

router.post("/logout", authController.postLogout);

// Sign up a new user
router.post("/signup", authController.postSignup);

// Login functionality
router.post("/login", authController.postLogin);

// Forgot password functionality
router.post("/forgot-password", authController.postForgotPassword);

router.post("/reset-password", authController.postResetPassword);

router.get("/forgot_password", authController.getForgotPassword);

router.get("/reset_password", authController.getResetPassword);

export default router;
