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
    const drafts = await Post.find({ status: "Draft", category: req.user.category })
      .populate("writer", "username")
      .populate("category", "categoryName")
      .lean();

    const categories = await Category.find().lean();
    const tags = await Tag.find().lean();

    res.render("editor/articles", { drafts, categories, tags });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading drafts");
  }
});



// Approve an article
router.post("/articles/approve/:id", async (req, res) => {
  try {
    const { category, tags, scheduledPublishTime } = req.body;

    await Post.findByIdAndUpdate(req.params.id, {
      status: "Approved",
      category,
      tags: [tags], // Ensure tags is an array
      scheduledPublishTime,
    });

    res.redirect("/editor");
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

    res.redirect("/editor"); // Redirect back to drafts page
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rejecting article");
  }
});

router.get("/manage", async (req, res) => {
  try {
    const approvedPosts = await Post.find({ status: "Approved" })
      .populate("writer", "username")
      .populate("category", "categoryName")
      .lean();

    const rejectedPosts = await Post.find({ status: "Rejected" })
      .populate("writer", "username")
      .populate("category", "categoryName")
      .lean();

    res.render("editor/manage", { approvedPosts, rejectedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching posts for management");
  }
});

// Handle AJAX request to fetch article data for modal
router.get('/articles/view/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Post.findById(articleId)
      .populate("writer", "username")
      .populate("category", "categoryName")
      .lean();

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article); // Return the article data as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading article");
  }
});


export default router;
