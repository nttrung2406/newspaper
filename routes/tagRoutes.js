import express from "express";
import tagController from "../controllers/tagController.js";

const router = express.Router();

router.get("/tags/:tagId", tagController.getPostsByTag);

export default router;
