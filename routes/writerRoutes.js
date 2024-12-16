import writerController from "../controllers/writerController.js";
import express from "express";
import { checkRole } from "../middlewares/roleMiddleware.js";
import preventCache from "../middlewares/preventCache.js";

const router = express.Router();

router.get("/", checkRole("writer"), writerController.getWriterPage);

router.get("/add-post", checkRole("writer"), writerController.getAddPost);

router.post("/add-post", checkRole("writer"), writerController.postAddPost);

router.get(
  "/edit-post/:postId",
  checkRole("writer"),
  writerController.getEditPost
);

router.post("/edit-post", checkRole("writer"), writerController.postEditPost);

router.get("/posts", checkRole("writer"), preventCache, writerController.getPosts);

router.get("/posts/:postId", checkRole("writer"), writerController.getPost);

router.post('/delete-post/:postId', checkRole("writer"), writerController.postDelete);

export default router;
