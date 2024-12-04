import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import mongoose from "mongoose";
import connectMongoDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import writerRoutes from "./routes/writerRoutes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config({ path: "./config/env/development.env" });

const app = express();
const store = new MongoDBStore(session)({
  uri: process.env.MONGO_DB_URI,
  collection: "sesions",
});
const PORT = process.env.PORT || 4000;

// Database connection
/* const testDatabaseConnection = async () => {
/* const testDatabaseConnection = async () => {
  try {
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    console.log(
      "Collections in database:",
      collections.map((c) => c.name)
    );
    console.log(
      "Collections in database:",
      collections.map((c) => c.name)
    );
  } catch (err) {
    console.error("Error fetching collections:", err.message);
    console.error("Error fetching collections:", err.message);
  }
};*/

// Connect to MongoDB and test connection
connectMongoDB().then(testDatabaseConnection); */

// Resolve __dirname equivalent in ESM
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");
app.set("view engine", "ejs");
app.set("views", "views");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "123456789",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
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
      req.user = user;
      res.locals.role = user.role;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// Static files
// app.use("/assets", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "views")));

// Pages
app.get("/", (req, res) => res.render("index"));
app.get("/categori", (req, res) => res.render("categori"));
app.get("/about", (req, res) => res.render("about"));
app.get("/latest_news", (req, res) => res.render("latest_news"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/elements", (req, res) => res.render("elements"));
app.get("/blog", (req, res) => res.render("blog"));
app.get("/single-blog", (req, res) => res.render("single-blog"));
app.get("/details", (req, res) => res.render("details"));
app.get("/auth", (req, res) => res.render("auth"));
app.use("/writer", writerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
