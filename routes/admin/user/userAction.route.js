import express from 'express'
import multer from 'multer';
const router = express.Router();
const upload = multer()
import userController from '../../../controllers/admin/userController.js';

router.route('/add')
.post(upload.none(), userController.addUser)
export default router;