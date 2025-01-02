import express from "express"
import catergoryController from "../../../controllers/admin/categoryController.js"
import multer from "multer";
const router = express.Router();
const upload = multer();

router.route("/add")
.post(upload.none(),catergoryController.addCategory);


router.get("/info/:id",catergoryController.viewCategory)

router.route("/update/:id")
.get(catergoryController.getCategoryForUpdate)
.post(upload.none(),catergoryController.updateCategory)
router.route("/delete/:id")
.post(catergoryController.deleteCategory)

export default router;
