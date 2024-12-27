import express from 'express';
import postController from '../../../controllers/admin/postController.js';

const router = express.Router();

router.get('/', postController.getPostList);

export default router;