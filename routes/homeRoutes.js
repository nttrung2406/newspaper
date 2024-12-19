import express from 'express';
import {renderHomePage} from '../controllers/homeController.js';

const router = express.Router();

// Route cho trang chủ
router.get('/', renderHomePage);

export default router;