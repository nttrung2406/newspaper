import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; 

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://hquoc12:1234567890@management.zlfzc.mongodb.net/management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new User({
            username: 'admin',
            email: '20127654@student.hcmus.edu.vn',
            password: hashedPassword,
            role: 'admin',
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
