
import express from 'express';
// import { protectedRoute } from '../middlewares/authMiddleware.js';
// import multer from 'multer';
// import path from 'path';
// import User from '../models/userModel.js';
import { createPost, getPosts, updatePost, deletePost, searchPostsByTitle, getPostById } from '../controllers/postController.js';
import { getMembership, getMembershipPostById } from '../controllers/membershipController.js'; // Import both controllers
// import { unlink } from 'fs';


const router = express.Router();

router.get('/search', searchPostsByTitle); // Search posts by title
router.post('/', createPost);            // Create a post
router.get('/', getPosts);               // Get all posts
router.put('/:id', updatePost);          // Update a post by ID
router.delete('/:id', deletePost);       // Delete a post by ID
router.get('/:id', getPostById); // Search posts by title
router.get("/membership/:id", getMembershipPostById); // Get a post by ID

export default router;
