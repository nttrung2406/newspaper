import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

const SECRET = process.env.JWT_SECRET || 'fallbackSecret'; 

// Generate reset token
export const generateResetToken = (userId) => {
    console.log(userId, SECRET, "11111111111111111111")
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
    // service: "gmail",
    host: "smtp.gmail.com", 
    port: 465,
    secure: true,
    // secureConnection: false,
    // requireTLS: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: "grhf vcsa qppj mjaw",
    },
    // tls: {
    //     ciphers:'SSLv3'
    // }
    // tls: {
    //     rejectUnauthorized: true
    // },
});

// Send password reset email
export const sendResetEmail = async (to, subject, text, html) => {
    console.log("4444444444444444444: ", to, subject, text, html);
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

