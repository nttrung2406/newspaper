import Post from "../models/postModel.js";
import Category from "../models/Category.js";
import {
  generateSlug,
  getTagsArray,
  decomposeTag,
} from "../utils/postHelpers.js";
import Tag from "../models/Tag.js";
import User from "../models/User.js";
import { get } from "http";

const PREVIEW_POST = 3;
const POSTS_PER_PAGE = 3;

const getFilteredPosts = async (req, res, next, status = null) => {
  const page = Math.max(1, +req.query.page || 1);

  const errorMessage = req.flash("error")[0] || null;
  const successMessage = req.flash("success")[0] || null;

  try {
    const filter = { writer: req.user._id };
    if (status) {
      filter.status = status; // Add status to the filter if provided
    }

    const totalPosts = await Post.countDocuments(filter);

    const lastPage =
      totalPosts > 0 ? Math.ceil(totalPosts / POSTS_PER_PAGE) : 1;

    if (page > lastPage) {
      return res.status(404).redirect(`/writer/posts?page=${lastPage}`);
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE);

    res.render("writer/writer-posts", {
      pageTitle: "Posts",
      path: "/writer/posts",
      status: status,
      posts: posts,
      errorMessage: errorMessage,
      successMessage: successMessage,
      currentPage: page,
      hasNextPage: POSTS_PER_PAGE * page < totalPosts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: lastPage,
    });
  } catch (err) {
    const error = new Error(
      err.message || "An error occurred while fetching posts"
    );
    error.statusCode = 500;
    next(error);
  }
};

const writerController = {
  getWriterPage: async (req, res, next) => {
    try {
      const posts = await Post.find({ writer: req.user._id })
        .sort({ createdAt: -1 })
        .limit(PREVIEW_POST);
      res.render("writer/writer", {
        pageTitle: "Writer",
        path: "/writer",
        posts: posts,
      });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  getPosts: async (req, res, next) => {
    await getFilteredPosts(req, res, next);
  },
  getPostsByStatus: async (req, res, next) => {
    const status = req.params.status;

    if (status === "all") {
      return res.redirect("/writer/posts");
    }

    await getFilteredPosts(req, res, next, status);
  },
  getAddPost: async (req, res, next) => {
    try {
      const categories = await Category.find({ parentID: { $ne: null } });

      res.render("writer/edit-post", {
        pageTitle: "Add New Post",
        path: "/writer/add-post",
        editing: false,
        categories: categories,
        categoryId: "",
        tagsString: "",
        post: "",
        isPremium: "",
      });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  postAddPost: async (req, res, next) => {
    const {
      title,
      content,
      categoryId,
      status,
      tagsString,
      isPremium,
      abstract,
    } = req.body;

    const tagsArray = getTagsArray(tagsString);

    try {
      const tags = [];
      for (const tagName of tagsArray) {
        let tag;

        const existingTag = await Tag.findOne({ tagName: tagName });

        if (existingTag) {
          tag = existingTag;
        } else {
          tag = new Tag({ tagName: tagName });
          await tag.save();
        }

        if (!tags.includes(tag._id)) {
          tags.push(tag._id);
        }
      }

      const post = new Post({
        title: title,
        slug: generateSlug(title) + new Date().toISOString(),
        content: content,
        status: status,
        writer: req.user._id,
        category: categoryId,
        tags: tags,
        premium: isPremium === "true",
        abstract: abstract,
      });
      await post.save();

      req.user.writerPosts.push(post._id);
      await req.user.save();

      req.flash("success", "Post created successfully");
      res.status(201).redirect("/writer/posts");
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  getEditPost: async (req, res, next) => {
    const editMode = req.query.edit;
    const pageNumber = req.query.page;

    if (!editMode) {
      return res.redirect("/");
    }

    try {
      const categories = await Category.find({ parentID: { $ne: null } });

      const postId = req.params.postId;

      const post = await Post.findById(postId);

      if (!post) {
        console.log("Post not found");
        return res.status(404).redirect("/writer");
      }

      let tagsString = "";

      for (const tagId of post.tags) {
        const tagObj = await Tag.findById(tagId);

        if (tagObj) {
          tagsString += decomposeTag(tagObj.tagName) + ", ";
        }
      }

      res.render("writer/edit-post", {
        pageTitle: "Edit Post",
        path: "/writer/edit-post",
        editing: true,
        post: post,
        categoryId: post.category,
        categories: categories,
        tagsString: tagsString,
        isPremium: post.premium,
        pageNumber: pageNumber,
      });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  postEditPost: async (req, res, next) => {
    const newTitle = req.body.title;
    const newContent = req.body.content;
    const newCategoryId = req.body.categoryId;
    const newTagsString = req.body.tagsString;
    const newAbstract = req.body.abstract;
    const newPremiumCheck = req.body.isPremium;
    const status = req.body.status;
    const postId = req.body.postId;

    const pageNumber = req.body.pageNumber;

    const newTagsArray = getTagsArray(newTagsString);

    try {
      const post = await Post.findById(postId);

      if (!post) {
        req.flash("error", "Post not found");
        return res.status(404).redirect(`/writer/posts?page=${pageNumber}`);
      }

      const newTags = [];

      for (const tagName of newTagsArray) {
        let tag;

        const existingTag = await Tag.findOne({ tagName: tagName });

        if (existingTag) {
          tag = existingTag;
        } else {
          tag = new Tag({ tagName: tagName });
          await tag.save();
        }

        if (!newTags.includes(tag._id)) {
          newTags.push(tag._id);
        }
      }

      post.title = newTitle;
      post.content = newContent;
      post.category = newCategoryId;
      post.tags = newTags;
      post.abstract = newAbstract;
      post.status = status;
      post.premium = newPremiumCheck === "true";

      await post.save();

      req.flash("success", "Updated post successfully!");
      return res.status(200).redirect(`/writer/posts?page=${pageNumber}`);
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  getPost: async (req, res, next) => {
    const postId = req.params.postId;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        req.flash("error", "Post not found!");
        return res.status(404).redirect("/writer/posts");
      }

      if (post.writer.toString() !== req.user._id.toString()) {
        req.flash("error", "You do not have permission to view this post!");
        return res.status(403).redirect("/writer/posts");
      }

      const category = await Category.findById(post.category);

      if (!category) {
        req.flash("error", "Category not found!");
        return res.status(404).redirect("/writer/posts");
      }

      res.render("writer/writer-post-detail", {
        pageTitle: "Post",
        path: "/writer/posts",
        post: post,
        writer: req.user.username,
        categoryName: category.categoryName,
      });
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  postDelete: async (req, res, next) => {
    const postId = req.params.postId;

    try {
      const result = await Post.findByIdAndDelete(postId);

      if (!result) {
        return res.status(500).json({ message: "Could not delete post" });
      }

      req.user.writerPosts.pull(postId);
      await req.user.save();

      return res.status(200).json({ message: "Deleted post successfully!" });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  postSubmit: async (req, res, next) => {
    const postId = req.params.postId;

    try {
      const post = await Post.findById(postId);
      post.status = "Submitted";
      await post.save();
      return res.status(200).json({ message: "Post submitted successfully!" });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default writerController;
