import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './config/env/development.env' });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    secure: false, // STARTTLS for port 587
});

const testEmail = async () => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: 'florianpicasso111@gmail.com', 
            subject: 'Test Email',
            text: 'This is a test email from Node.js',
        });
        console.log('Email sent:', info.messageId);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection failed:', error);
    } else {
        console.log('SMTP connection successful');
        testEmail();
    }
});
