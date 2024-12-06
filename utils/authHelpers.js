import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

const SECRET = process.env.JWT_SECRET || 'fallbackSecret'; 

// Generate reset token
export const generateResetToken = (userId) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: '12h' }); // Token expires in 12 hour
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
    host: "smtp.gmail.com", 
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: "grhf vcsa qppj mjaw",
    },

});

// Send password reset email
export const sendResetEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: emailConfig.auth.user,
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

