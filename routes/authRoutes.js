import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; 
import { sendResetEmail, generateResetToken, validateResetToken } from '../utils/authHelpers.js';
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config({ path: './config/env/development.env' });

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
  },
  secure: false, // STARTTLS for port 587
});

// Sign up a new user
router.post('/signup', async (req, res) => {
  // console.log("Info: ", req.body);
  const { username, email, password, role } = req.body;

  try {
    // Input validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Prevent Admin role signup
    if (role === 'Admin') {
      return res.status(403).json({ message: 'Cannot sign up as Admin.' });
    }    

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    
    console.error('Error signing up:', error.errorResponse.errInfo.details.schemaRulesNotSatisfied[0]);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Login functionality
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and verify password (hash check omitted for brevity)
    const user = await User.findOne({ email });


    if (!user && !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send('Invalid credentials');
    }

    // Save user data to session (or JWT token)
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Redirect to index after login
    res.redirect('/index');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Forgot password functionality
router.post('/forgot-password', async (req, res) => {
  console.log('req', req);
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'No user found with that email.' });
      }

      const token = generateResetToken(user._id);
      const resetLink = `http://localhost:4000/reset-password?token=${token}`;

      await sendResetEmail(
          email,
          'Password Reset Request',
          `Click the link to reset your password: ${resetLink}`,
          `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
      );

      res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
      console.error('Error in forgot-password route:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword; 
    user.resetToken = undefined; 
    user.resetTokenExpiry = undefined; 
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Error in reset-password route:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;