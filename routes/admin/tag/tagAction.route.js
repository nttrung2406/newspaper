import express from 'express'
import tagController from '../../../controllers/admin/tagController.js'
import multer from 'multer';


const router = express.Router();
const upload = multer();


router.route('/create')
.post(upload.none(),tagController.addTag)

router.route('/info/:id')
.get(tagController.viewTag)

router.route('/update/:id')
.post(upload.none(), tagController.updateTag)

export default router;