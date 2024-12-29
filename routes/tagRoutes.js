import express from "express";
import tagController from "../controllers/tagController.js";

const router = express.Router();

router.get("/tag/:tagId", tagController.getPostsByTag);

export default router;
