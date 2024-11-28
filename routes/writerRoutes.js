import writerController from "../controllers/writerController.js";
import express from "express";

const router = express.Router();

router.get("/edit-post", writerController.getEditPost);

router.post("/edit-post", writerController.postEditPost);

export default router;
