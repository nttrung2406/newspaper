import express from 'express';
import { getCommentsByPostId, addComment } from '../controllers/commentController.js';
const router = express.Router();

// Lấy tất cả comment theo postId
router.get('/:postId', getCommentsByPostId);

// Thêm comment mới
router.post('/', addComment);

export default router;
