import Tag from "../models/Tag.js";
import Post from "../models/postModel.js";
import mongoose from "mongoose";

const tagController = {
  getPostsByTag: async (req, res, next) => {
    const tagId = req.params.tagId;
    try {
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        throw new Error("Invalid Tag ID");
      }
      const posts = await Post.find({ tags: tagId }).populate("tags");
      const updatedPosts = posts.map((post) => {
        const match = post.content.match(/<img[^>]*src="([^"]+)"[^>]*>/);
        let imageUrl = match ? match[1] : null;

        if (imageUrl) {
          imageUrl = imageUrl.replace(/&amp;/g, "&");
        }
        return {
          _id: post._id,
          title: post.title,
          abstract: post.abstract,
          content: post.content,
          tags: post.tags,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          imageUrl,
        };
      });
      res.render("tags", {
        pageTitle: "Post by Tag",
        posts: updatedPosts,
      });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
};

export const getAllTagsPaginated = async (req, res, next) => {
  try {
    const { page = 1, search = "" } = req.query; // Retrieve page and search from query parameters
    const limit = 10; // Number of tags per page
    const skip = (page - 1) * limit;

    // Add search functionality
    const query = search
      ? { tagName: { $regex: search, $options: "i" } } // Case-insensitive search
      : {};

    const totalTags = await Tag.countDocuments(query);
    const tags = await Tag.find(query).skip(skip).limit(limit);

    res.render("tagList", {
      pageTitle: "Tags",
      tags,
      totalPages: Math.ceil(totalTags / limit),
      currentPage: parseInt(page, 10),
      search,
    });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    next(error);
  }
};



export default tagController;
