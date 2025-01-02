import express from "express";
import tagController from "../controllers/tagController.js";
import { getAllTagsPaginated } from "../controllers/tagController.js";
const router = express.Router();

router.get("/tags/:tagId", tagController.getPostsByTag);
router.get("/tags", getAllTagsPaginated);

export default router;
