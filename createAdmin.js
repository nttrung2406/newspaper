import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; 

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://26.174.246.225:27017/management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new User({
            username: 'admin',
            email: 'florianpicasso111@gmail.com',
            password: hashedPassword,
            role: 'Admin',
        });

        // Save the admin user to the database
        await adminUser.save();
        console.log('Admin user created successfully:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdminUser();
