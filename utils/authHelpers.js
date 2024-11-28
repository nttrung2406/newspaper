import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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

export const sendResetEmail = async (email, token) => {
    const resetLink = `http://localhost:4000/reset-password?token=${token}`;
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-password',
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
};
