import express from 'express';
import postController from '../../../controllers/admin/postController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.route('/detail/:id')
.get(postController.viewPostContent)

router.route('/premium')
.post(upload.none(), postController.setPremium)

router.route('/publish')
.post(upload.none(), postController.setPublish)

export default router;