import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import connectMongoDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import setUserData from "./middlewares/setUserData.js";
import writerRoutes from "./routes/writerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { dirname } from "path";
import MongoDBStore from "connect-mongodb-session";
import User from "./models/User.js";

dotenv.config({ path: "./config/env/development.env" });

const app = express();
const store = new MongoDBStore(session)({
  uri: process.env.MONGO_DB_URI,
  collection: "sesions",
});
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

// connectMongoDB().then(testDatabaseConnection);

// Resolve __dirname equivalent in ESM
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("view engine", "ejs");
app.set("views", "views");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: "secret", // Replace with a strong secret key for session encryption
    resave: false, // Don't resave session if it hasn't changed
    saveUninitialized: true, // Save a session even if it is new and hasn't been modified
    store: store,
    cookie: {
      httpOnly: true, // Security measure: prevent access to cookie via JavaScript
      secure: false, // If using https, set to true; for development, set to false
      maxAge: 1000 * 60 * 60 * 24, // Set the session expiration time (optional, here it's 1 day)
    },
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

// Use user
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/writer", writerRoutes);

// Pages
app.get("/", (req, res) => res.render("index"));
app.get("/index", (req, res) => res.render("index"));
app.get("/categori", (req, res) => res.render("categori"));
app.get("/about", (req, res) => res.render("about"));
app.get("/latest_news", (req, res) => res.render("latest_news"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/elements", (req, res) => res.render("elements"));
app.get("/blog", (req, res) => res.render("blog"));
app.get("/single-blog", (req, res) => res.render("single-blog"));
app.get("/details", (req, res) => res.render("details"));

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("Connected");
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
