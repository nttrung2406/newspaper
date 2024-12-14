import express from 'express';
import { getCategory } from '../controllers/categoryController.js'; // Đảm bảo đường dẫn đúng

const router = express.Router();

// Đảm bảo controller được gọi chính xác
router.get('/categori', getCategory);

export default router;
