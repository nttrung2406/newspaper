import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './config/env/development.env' });

const SECRET = process.env.JWT_SECRET || 'fallbackSecret'; 

// Generate reset token
export const generateResetToken = (userId) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: '12h' }); // Token expires in 1 hour
};

// Validate reset token
export const validateResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded.userId; // Return userId if valid
    } catch (err) {
        console.error('Invalid or expired token:', err);
        return null;
    }
};

// Nodemailer transporter
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    secure: false, // STARTTLS for port 587
});

// Send password reset email
export const sendResetEmail = async (to, token) => {
    const resetLink = `https://newspaper-2uw4.onrender.com//reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Use the following link to reset your password: ${resetLink}`;
    const html = `<p>You requested a password reset. Click the link below to reset your password:</p>
                  <a href="${resetLink}">${resetLink}</a>`;

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent: ${info.messageId}`);
        return { success: true, message: 'Email sent', info };
    } catch (err) {
        console.error('Error sending email:', err);
        return { success: false, message: 'Failed to send email', error: err };
    }
};

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection failed:', error);
    } else {
        console.log('SMTP connection successful');
        sendResetEmail();
    }
});
