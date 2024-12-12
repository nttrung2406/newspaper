import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  sendResetEmail,
  generateResetToken,
  validateResetToken,
} from "../utils/authHelpers.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config/env/development.env" });


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
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
      });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error(
        "Error signing up:",
        error.errorResponse.errInfo.details.schemaRulesNotSatisfied[0]
      );
      res.status(500).json({ message: "Internal server error." });
    }
  },
  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      //console.log(user)
      if (!user) {return res.redirect("/");}
      if ((await !bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid credentials");
      }

      // Save user data to session (or JWT token)
      req.session.isLoggedIn = true;
      req.session.user = user;

      return req.session.save((err) => {
        console.log(err);
        if ( req.session.user.role === 'admin'){
          res.redirect('/admin');
        }
        else if ( req.session.user.role === 'editor'){
          res.redirect('/editor');
        }
        else {res.redirect("/index");}
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  postForgotPassword: async (req, res) => {
    console.log("req", req);
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with that email." });
      }

      const token = generateResetToken(user._id);
      const resetLink = `https://newspaper-2uw4.onrender.com/auth/reset_password?token=${token}`;

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

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res
        .status(200)
        .json({ message: "Password has been reset successfully." });
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
  getForgotPassword: (req, res) =>
    res.render("forgot_password", {
      user: req.user,
    }),
  getResetPassword: (req, res) => {
    const { token } = req.query;
    res.render("reset_password", { token });
  },
};

export default authController;
