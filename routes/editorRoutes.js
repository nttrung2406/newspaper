// editorRoutes.js

import express from "express";
import { getDrafts, approveArticle, rejectArticle, manageArticles, viewArticle, publishPosts } from '../controllers/editorController.js'; 

const router = express.Router();

// Define the route handlers
router.get("/", getDrafts);

// Approve an article
router.post("/articles/approve/:id", approveArticle);

// Reject an article
router.post("/articles/reject/:id", rejectArticle);

// Manage approved and rejected articles
router.get("/manage", manageArticles);

// Handle AJAX request to fetch article data for modal
router.get('/articles/view/:id', viewArticle);

router.post('/articles/publish/:id', publishPosts);

export default router;
