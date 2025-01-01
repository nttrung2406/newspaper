// editorController.js

import Post from "../models/postModel.js"; 
import Category from "../models/Category.js"; 
import Tag from "../models/Tag.js"; 

// Controller for getting drafts
export const getDrafts = async (req, res) => {
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
};

// Controller for approving an article
export const approveArticle = async (req, res) => {
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
};

// Controller for rejecting an article
export const rejectArticle = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    await Post.findByIdAndUpdate(req.params.id, {
      status: "Rejected",
      rejectionReason,
    });

    res.redirect("/editor");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rejecting article");
  }
};

// Controller for managing approved and rejected articles
export const manageArticles = async (req, res) => {
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
};

// Controller for viewing article details in the modal (AJAX)
export const viewArticle = async (req, res) => {
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
};
