import express from 'express';
import postController from '../../../controllers/admin/postController.js';

const router = express.Router();

router.get('/', postController.renderPage);
router.get('/data', postController.getPostList);

export default router;