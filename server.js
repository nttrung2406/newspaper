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
import { authorizeRole } from "./middlewares/authMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import writerRoutes from "./routes/writerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";
import { dirname } from "path";
import MongoDBStore from "connect-mongodb-session";
import errorController from "./controllers/error.js";
import User from "./models/User.js";
import {getMembership} from "./controllers/membershipController.js"
import {getPostsData} from "./controllers/postController.js"
import { getCategory } from './controllers/categoryController.js';

dotenv.config({ path: "./config/env/development.env" });

const app = express();
const store = new MongoDBStore(session)({
  uri: process.env.MONGO_DB_URI,
  collection: "sesions",
});
const PORT = process.env.PORT || 4000;

// Database connection
const testDatabaseConnection = async () => {
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
  res.locals.role = "";
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
      res.locals.role = user.role;
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// routes
app.use("/auth", authRoutes);
app.use("/posts", authorizeRole(["admin", "editor", "writer"]), postRoutes);
app.use(
  "/users",
  authorizeRole(["membership", "editor", "writer"]),
  userRoutes
);
app.use("/admin", authorizeRole(["admin"]), adminRoutes);
app.use("/editor", authorizeRole(["editor"]), editorRoutes);
app.use("/writer", authorizeRole(["writer"]), writerRoutes);

// Pages
app.get("/", (req, res) => res.render("index"));
app.get("/index", (req, res) => res.render("index"));
app.get("/categori", async (req, res) => {
  try {
      const categories = await getCategory(req, res);
      const memberships = await getMembership(req,res);
      const posts= await getPostsData(req,res);
      res.render("categori", {
          freeCategories: categories,
          posts,
          memberships,
          isPremium: false, // xử lí premium
      });

  } catch (error) {
      console.error("Error fetching categories:", error.message);
      res.status(500).send("Internal Server Error");
  }
});
app.get("/about", (req, res) => res.render("about"));
app.get("/latest_news", (req, res) => res.render("latest_news"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/elements", (req, res) => res.render("elements"));
app.get("/blog", (req, res) => res.render("blog"));
app.get("/single-blog", (req, res) => res.render("single-blog"));
app.get("/details", (req, res) => res.render("details"));


app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("Connected");
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });