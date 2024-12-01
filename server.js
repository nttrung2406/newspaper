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
import userRoutes from './routes/userRoutes.js';
import setUserData from './middlewares/setUserData.js';

dotenv.config({ path: './config/env/development.env' });

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
/* const testDatabaseConnection = async () => {
  try {
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    console.log(
      "Collections in database:",
      collections.map((c) => c.name)
    );
  } catch (err) {
    console.error("Error fetching collections:", err.message);
  }
};

connectMongoDB().then(testDatabaseConnection);

// Resolve __dirname equivalent in ESM
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: 'secret',  // Replace with a strong secret key for session encryption
  resave: false,              // Don't resave session if it hasn't changed
  saveUninitialized: true,    // Save a session even if it is new and hasn't been modified
  cookie: {
      httpOnly: true,         // Security measure: prevent access to cookie via JavaScript
      secure: false,          // If using https, set to true; for development, set to false
      maxAge: 1000 * 60 * 60 * 24 // Set the session expiration time (optional, here it's 1 day)
  }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', authMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'views')));

// Use user
app.use(setUserData);

// Pages
app.get('/', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));
app.get('/categori', (req, res) => res.render('categori'));
app.get('/about', (req, res) => res.render('about'));
app.get('/latest_news', (req, res) => res.render('latest_news'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/elements', (req, res) => res.render('elements'));
app.get('/blog', (req, res) => res.render('blog'));
app.get('/single-blog', (req, res) => res.render('single-blog'));
app.get('/details', (req, res) => res.render('details'));
app.get('/auth', (req, res) => res.render('auth'));
app.get('/forgot_password', (req, res) => res.render('forgot_password'));
app.get('/reset_password', (req, res) => {
  const { token } = req.query;
  res.render('reset_password', { token });
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth'); 
  }
  res.render('profile', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('Logout failed.');
      }
      res.clearCookie('connect.sid'); 
      res.redirect('/index'); 
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    req.session.user = { username: user.username }; 
    res.redirect('/profile');
  } else {
    res.redirect('/auth'); 
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
