import express from 'express'
import multer from 'multer';
const router = express.Router();
const upload = multer()
import userController from '../../../controllers/admin/userController.js';

router.route('/add')
.post(upload.none(), userController.addUser)

router.route('/info/:id')
.get(userController.viewUserDetail)

router.route('/update/:id')
.post(upload.none(), userController.updateUser)

export default router;