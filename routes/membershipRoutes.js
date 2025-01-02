import express from 'express';
import { getMembershipPostById } from '../controllers/membershipController.js';
const router = express.Router();

// Route to render the '/membership post' page
router.get("/:id", getMembershipPostById); // Get a post by ID

export default router;
