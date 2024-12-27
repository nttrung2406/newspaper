import express from 'express';
import { getCategory, getIndex } from '../controllers/categoryController.js'; // Import both controllers

const router = express.Router();

// Route to render the 'categori' page
router.get('/', getCategory);

// Route to render the 'index' page
router.get('/index', getIndex); // You can also use '/index' if you want to have a separate route for 'index'


export default router;
