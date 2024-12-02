import express from 'express'
import categoryController from '../../../controllers/admin/categoryController.js'
const router = express.Router()

router.get('/', categoryController.getCategories)


export default router