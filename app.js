const express = require('express');
const app = express();
require('dotenv').config({ path: './config/env/development.env' });

const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());  
app.use('/admin', authMiddleware); 

app.use('/articles', articleRoutes);  
app.use('/users', userRoutes);        
app.use('/admin', adminRoutes);       

app.use(errorHandler);
app.listen(3300, () => {
    console.log('Server is running on port 3300');
});
