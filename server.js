import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// import articleRoutes from './routes/articleRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
import authMiddleware from './middlewares/authMiddleware.js';
// import errorHandler from './middlewares/errorHandler.js';
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import ConnectMongoDBSession from 'connect-mongodb-session';
const MongoDBStore = ConnectMongoDBSession(session);

dotenv.config({ path: './config/env/development.env' });

const app = express();
const PORT = process.env.PORT || 4000;

connectMongoDB();


// Resolve __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');

app.use(express.json());  
app.use('/admin', authMiddleware);

// Uncomment and integrate the routes as needed
// app.use('/articles', articleRoutes);
// app.use('/users', userRoutes);
// app.use('/admin', adminRoutes);
// app.use(errorHandler);

app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'views')));

app.get("/", (req, res) => {
    res.render('index');
});

app.get('/categori', (req, res) => {
    res.render('categori');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/latest_news', (req, res) => {
    res.render('latest_news');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/elements', (req, res) => {
    res.render('elements');
});

app.get('/blog', (req, res) => {
    res.render('blog');
});

app.get('/single-blog', (req, res) => {
    res.render('single-blog');
});

app.get('/details', (req, res) => {
    res.render('details');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
