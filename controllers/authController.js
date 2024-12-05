import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/env/development.env" });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate a reset token
const generateResetToken = () => crypto.randomBytes(32).toString("hex");

// Utility to send reset email
const sendResetEmail = async (to, subject, textContent, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Newspaper App" <${process.env.SMTP_USER}>`, // Sender address
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`Reset email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const authController = {
  getAuth: (req, res) => {
    res.render("auth");
  },

  postSignup: async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
      // Input validation
      if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Prevent Admin role signup
      if (role === "admin") {
        return res.status(403).json({ message: "Cannot sign up as Admin." });
      }

      // Check for existing email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error("Error signing up:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid credentials");
      }

      // Save user data to session
      req.session.isLoggedIn = true;
      req.session.user = user;

      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        }
        if (req.session.user.role === "admin") {
          res.redirect("/admin");
        } else {
          res.redirect("/index");
        }
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  postForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with that email." });
      }

      // Generate a reset token
      const token = generateResetToken();
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiry
      await user.save();

      // Generate reset link
      const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

      // Send reset email
      await sendResetEmail(
        email,
        "Password Reset Request",
        `Click the link to reset your password: ${resetLink}`,
        `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
      );

      res
        .status(200)
        .json({ message: "Password reset link sent to your email." });
    } catch (error) {
      console.error("Error in forgot-password route:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  postResetPassword: async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token." });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.status(200).json({ message: "Password has been reset successfully." });
    } catch (err) {
      console.error("Error in reset-password route:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  getProfile: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/auth");
    }
    res.render("profile", { user: req.session.user });
  },

  postLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Logout failed.");
      }
      res.clearCookie("connect.sid");
      res.redirect("/index");
    });
  },

  getForgotPassword: (req, res) => {
    res.render("forgot_password");
  },

  getResetPassword: (req, res) => {
    const { token } = req.query;
    res.render("reset_password", { token });
  },
};

export default authController;
