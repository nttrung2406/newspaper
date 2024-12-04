import express from "express"
import catergoryController from "../../../controllers/admin/categoryController.js"
const router = express.Router();

router.route("/create")
.get(async(req, res) =>{
    const parentNames = await catergoryController.getParentID();
    //console.log(parentNames);

    const message = req.flash('category_create_err')
    res.render("admin/category/category_create", {parentNames, message});
})
.post(catergoryController.addCategory);


// router.get("/info/:id")
// router.get("/update/:id")
// router.get("/delete/:id")

export default router;