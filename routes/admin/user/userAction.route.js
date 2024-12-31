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

router.route('/list')
.get(userController.getPremiumUSer)

router.route('/extend')
.post(upload.none(), userController.extendPremium)

router.route('/assign')
.get(userController.getEditorList)
.post(upload.none(), userController.assignCategory)

router.route('/category-list')
.post(upload.none(), userController.getAssignCategory)

export default router;