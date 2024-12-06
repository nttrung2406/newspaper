import express from 'express'
import categoryController from '../../../controllers/editor/categoryController.js'
const router = express.Router()

router.get('/', categoryController.getCategories)


export default router