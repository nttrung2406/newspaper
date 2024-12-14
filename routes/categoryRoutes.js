import express from 'express';
import { getCategory,createPost, getPosts, updatePost, deletePost, searchPostsByTitle } from '../controllers/postController.js';

const router = express.Router();

router.get('/categori', getCategory); //


export default router;