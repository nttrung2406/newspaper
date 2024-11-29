import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import authMiddleware from './middlewares/authMiddleware.js';

dotenv.config({ path: './config/env/development.env' });

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
const testDatabaseConnection = async () => {
  try {
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
  } catch (err) {
    console.error('Error fetching collections:', err.message);
  }
};

// Connect to MongoDB and test connection
connectMongoDB().then(testDatabaseConnection);

// Resolve __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || '123456789',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(flash());
app.use('/admin', authMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'views')));

// Pages
app.get('/', (req, res) => res.render('index'));
app.get("/categori", (req, res) => {
  //test
  const user = {
    name: "John Doe",
    isPremium: true, // tắt chạy lại
  };

  const premiumCategories = [
    { "id": "finance", "name": "Finance" },
    { "id": "advanced tech", "name": "Advanced Tech" },
    { "id": "exclusive interviews", "name": "Exclusive Interviews" }
  ];

  res.render("categori", {
    premiumCategories: premiumCategories,
    isPremium: user.isPremium,
  });
});
app.get('/about', (req, res) => res.render('about'));
app.get('/latest_news', (req, res) => res.render('latest_news'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/elements', (req, res) => res.render('elements'));
app.get('/blog', (req, res) => res.render('blog'));
app.get('/single-blog', (req, res) => res.render('single-blog'));
app.get('/details', (req, res) => res.render('details'));
app.get('/auth', (req, res) => res.render('auth'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
