import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; 

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
  const { username, email, password, role } = req.body;

  try {
    // Input validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
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
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Login functionality
router.post('/login', async (req, res) => {
  console.log(req.body)  // For debugging purposes, print the request body to the console.
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Success: Respond with user details (exclude sensitive data)
    res.status(200).json({ message: 'Login successful!', user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Forgot password functionality
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    // Generate reset token
    const token = Math.random().toString(36).slice(2);
    user.token = token;
    await user.save();

    // Send reset password email
    const resetUrl = `http://localhost:4000/reset-password/${token}`;
    await transport.sendMail({
      from: '"Support Team" <support@example.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 1 hour.</p>`,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Reset password functionality
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Update password and clear token
    user.password = await bcrypt.hash(newPassword, 10);
    user.token = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
