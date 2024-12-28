import express from 'express';
import postController from '../../../controllers/admin/postController.js';

const router = express.Router();

router.route('/detail/:id')
.get(postController.viewPostContent)





export default router;