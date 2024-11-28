import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; 
import { sendResetEmail, generateResetToken, validateResetToken } from '../utils/authHelpers.js';

const router = express.Router();

// Nodemailer transport setup
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "your_user_name",
    pass: "your_password",
  },
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
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
      return res.status(404).json({ message: 'No user found with that email.' });
  }

  const token = generateResetToken(user._id);
  await sendResetEmail(email, token); // Send the reset link via email
  res.status(200).json({ message: 'Password reset link sent to your email.' });
});

// Reset Password POST route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const userId = validateResetToken(token);
  if (!userId) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
  res.status(200).json({ message: 'Password reset successful.' });
});


export default router;
