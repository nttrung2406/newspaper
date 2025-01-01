import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  sendResetEmail,
  generateResetToken,
  validateResetToken,
} from "../utils/authHelpers.js";
import dotenv from "dotenv";
import UserInformation from "../models/UserInformation.js";
dotenv.config({ path: "./config/env/development.env" });
import { validationResult } from "express-validator";

const authController = {
  getAuth: (req, res) => {
    let errorMessage = req.flash("error")[0] || null;
    res.render("auth", {
      errorMessage: errorMessage,
    });
  },
  getEditPassword: async (req, res) => {
    res.render("edit-password", {
      oldInput: {
        password: "",
        newPassword: "",
        confirmPassword: "",
      },
      errorMessage: null,
      validationErrors: [],
    });
  },
  postEditPassword: async (req, res) => {
    const { password, newPassword, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("edit-password", {
        oldInput: {
          password: password,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    try {
      const newHashedPassword = await bcrypt.hash(newPassword, 12);
      req.user.password = newHashedPassword;
      await req.user.save();
      req.flash("success", "Password updated successfully!");
      res.status(200).redirect("/auth/profile");
    } catch (err) {
      res.status(500).json({ message: "Internal server error." });
    }
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

      if (!user) {
        return res.redirect("/");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash("error", "Incorrect password! Please try again.");
        return res.status(401).redirect("/auth");
      }
      // Save user data to session (or JWT token)
      req.session.isLoggedIn = true;
      req.session.user = user;

      return req.session.save((err) => {
        console.log(err);
        if (req.session.user.role === "admin") {
          res.redirect("/admin");
        } else if (req.session.user.role === "editor") {
          res.redirect("/editor");
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
  getProfile: async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/auth");
    }

    let successMessage = req.flash("success")[0] || null;

    const user = req.session.user;

    const userInformation = await UserInformation.findOne({
      accountID: user._id,
    });

    if (user.role === "membership") {
      // Calculate remaining time in the controller
      const now = new Date();
      const endDate = new Date(user.membership.endDate);
      const startDate = new Date(user.membership.startDate);

      let remainingTime = "Đã hết hạn";
      let isExpired = false;

      if (endDate >= now) {
        isExpired = false;
        const diffInMs = endDate - now;
        const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
        remainingTime = `${days} ngày, ${hours} giờ, ${minutes} phút còn lại`;
      } else {
        isExpired = true;
      }

      // Prepare extra info to pass to the view
      const extraInfo = {
        isExpired,
        remainingTime,
        formattedStartDate: startDate.toLocaleString("vi-VN"),
        formattedEndDate: endDate.toLocaleString("vi-VN"),
      };
      return res.render("profile", {
        user: user,
        userInfo: userInformation,
        extraInfo: extraInfo,
        successMessage: successMessage,
      });
    }

    res.render("profile", {
      user: user,
      userInfo: userInformation,
      successMessage: successMessage,
    });
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
  postUpdateProfile: async (req, res) => {
      const userId = req.session.user._id;
      const { username, email, fullname, dateOfBirth, penName, contactEmail } = req.body;

      try {
          // Input validation
          if (!username || !email || !fullname || !dateOfBirth || !contactEmail) {
              req.session.errorMessage = "All fields are required.";
              return res.redirect('/auth/profile');
          }

          // Validate email formats
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email) || !emailRegex.test(contactEmail)) {
              req.session.errorMessage = "Please enter valid email addresses.";
              return res.redirect('/auth/profile');
          }

          // Check if primary email is being updated and if it's already in use
          const existingUser = await User.findOne({ 
              email, 
              _id: { $ne: userId } 
          });
          
          if (existingUser) {
              req.session.errorMessage = "Email already in use by another account.";
              return res.redirect('/auth/profile');
          }

          // Update User model
          const user = await User.findById(userId);
          user.username = username;
          user.email = email;
          await user.save();

          // Update UserInformation model
          const userInfo = await UserInformation.findOne({ accountID: userId });
          if (userInfo) {
              userInfo.fullname = fullname;
              userInfo.dateOfBirth = new Date(dateOfBirth);
              userInfo.contact = contactEmail; // Update contact email
              
              // Only update penName if user is a writer and penName is provided
              if (user.role === 'writer' && penName) {
                  userInfo.penName = penName;
              }
              
              await userInfo.save();
          }

          // Update session
          req.session.user = user;
          req.session.successMessage = "Profile updated successfully!";

          res.redirect('/auth/profile');
      } catch (error) {
          console.error("Error updating profile:", error);
          req.session.errorMessage = "An error occurred while updating your profile.";
          res.redirect('/auth/profile');
      }
  }
};

export default authController;
