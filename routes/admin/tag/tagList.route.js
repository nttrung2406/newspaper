import express from 'express'
import tagController from '../../../controllers/admin/tagController.js'

const router = express.Router();

router.route('/')
.get(tagController.viewTagList)


export default router;