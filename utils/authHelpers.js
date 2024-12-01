import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

const SECRET = 'secret';

export const generateResetToken = (userId) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
};

export const validateResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded.userId;
    } catch (err) {
        return null;
    }
};

export const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
    },
    secure: false,
});

export const sendResetEmail = async (to, token) => {
    const resetLink = `http://sgnews.com/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Use the following link to reset your password: ${resetLink}`;
    const html = `<p>You requested a password reset. Click the link below to reset your password:</p>
                  <a href="${resetLink}">${resetLink}</a>`;

    try {
        const info = await transporter.sendMail({
            from: emailConfig.auth.user,
            to, 
            subject,
            text,
            html,
        });
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
};