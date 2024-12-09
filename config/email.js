import dotenv from 'dotenv';
dotenv.config({ path: './config/env/development.env' });
export const emailConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: "grhf vcsa qppj mjaw",
    },
    secure:  true,
};
