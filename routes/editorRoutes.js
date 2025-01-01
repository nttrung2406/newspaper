import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Post from "../models/postModel.js"; 
import Category from "../models/Category.js"; 
import Tag from "../models/Tag.js"; 

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.use(express.static(path.join(__dirname, "../public/editor")));

router.get("/", async (req, res) => {
  try {
    console.log("Category can be managed: ", req.user.category);
    const drafts = await Post.find({ status: "Draft", category: req.user.category })
      .populate("writer", "username") 
      .populate("category", "categoryName")
      .lean(); 
    
    const categories = await Category.find().lean(); 
    const tags = await Tag.find().lean();

    res.render("editor/articles", { drafts, categories, tags }); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching drafts");
  }
});


// Approve an article
router.post("/articles/approve/:id", async (req, res) => {
  try {
    const { category, tags, scheduledPublishTime } = req.body;

    await Post.findByIdAndUpdate(req.params.id, {
      status: "Approved",
      category,
      tags: Array.isArray(tags) ? tags : [tags], // Ensure tags is an array
      scheduledPublishTime,
    });

    res.redirect("/editor/articles");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving article");
  }
});


// Reject an article
router.post("/articles/reject/:id", async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    await Post.findByIdAndUpdate(req.params.id, {
      status: "Rejected",
      rejectionReason,
    });

    res.render("editor/", { drafts, categories, tags }); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rejecting article");
  }
});

export default router;
