import express from 'express';
import { getCommentsByPostId, addComment, deleteComment } from '../controllers/commentController.js';
const router = express.Router();

// Lấy tất cả comment theo postId
router.get('/:postId', getCommentsByPostId);

// Thêm comment mới
router.post('/', addComment);
router.delete('/:id', deleteComment);       // Xóa bình luận

export default router;
