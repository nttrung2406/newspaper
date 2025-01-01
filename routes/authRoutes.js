import express from "express";
const router = express.Router();
import { body } from "express-validator";
import bcrypt from "bcryptjs";

import authController from "../controllers/authController.js";

router.get("/", authController.getAuth);

router.get("/profile", authController.getProfile);

router.get("/profile/edit-password", authController.getEditPassword);

router.post(
  "/profile/edit-password",
  [
    body("password").custom(async (value, { req }) => {
      const isMatch = await bcrypt.compare(value, req.user.password);
      if (!isMatch) {
        return Promise.reject("Incorrect password! Please try again.");
      }
    }),
    body("newPassword")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .custom(async (value, { req }) => {
        const isMatch = await bcrypt.compare(value, req.user.password);
        if (isMatch) {
          return Promise.reject(
            "This one is already in used. Please try another one."
          );
        }
      }),
    body("confirmPassword")
      .trim()
      .custom(async (value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.postEditPassword
);

router.post("/logout", authController.postLogout);

// Sign up a new user
router.post("/signup", authController.postSignup);

// Login functionality
router.post("/login", authController.postLogin);

router.post("/profile/update", authController.postUpdateProfile);

// Forgot password functionality
router.post("/forgot-password", authController.postForgotPassword);

router.post("/reset-password", authController.postResetPassword);

router.get("/forgot_password", authController.getForgotPassword);

router.get("/reset_password", authController.getResetPassword);

export default router;
