import Post from "../models/postModel.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

const PREVIEW_POST = 3;

const writerController = {
  getWriterPage: async (req, res, next) => {
    let errorMessage = req.flash("error");

    if (errorMessage.length > 0) {
      errorMessage = errorMessage[0];
    } else {
      errorMessage = null;
    }

    let successMessage = req.flash("success");

    if (successMessage.length > 0) {
      successMessage = successMessage[0];
    } else {
      successMessage = null;
    }

    try {
      const posts = await Post.find({ writer: req.user._id })
        .sort({ createdAt: -1 })
        .limit(PREVIEW_POST);
      res.render("writer", {
        pageTitle: "Writer",
        path: "/writer",
        posts: posts,
        successMessage: successMessage,
        errorMessage: errorMessage,
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error", error: err });
    }
  },
  getPosts: (req, res, next) => {
    res.render("writer-posts", {
      pageTitle: "Posts",
      path: "/writer/posts",
    });
  },
  getAddPost: (req, res, next) => {
    res.render("edit-post", {
      pageTitle: "Add New Post",
      path: "/writer/add-post",
      editing: false,
      categoryName: "",
      post: "",
    });
  },
  postAddPost: async (req, res, next) => {
    const { title, content, categoryName, status } = req.body;

    try {
      const category = await Category.findOne({ categoryName: categoryName });
      if (!category) {
        req.flash("error", "Category not found");
        return res.status(404).redirect("/writer");
      }
      const post = new Post({
        title: title,
        content: content,
        status: status,
        writer: req.user._id,
        category: category._id,
      });
      await post.save();

      req.user.writerPosts.push(post._id);
      await req.user.save();

      req.flash("success", "Post created successfully");
      res.status(201).redirect("/writer");
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "An error occured", error: err.message });
    }
  },
  getEditPost: async (req, res, next) => {
    try {
      const editMode = req.query.edit;

      if (!editMode) {
        return res.redirect("/");
      }

      const postId = req.params.postId;

      const post = await Post.findById(postId);

      if (!post) {
        console.log("Post not found");
        return res.status(404).redirect("/writer");
      }

      const category = await Category.findById(post.category);

      if (!category) {
        console.log("Category not found for this post");
        return res.status(404).redirect("/writer");
      }

      res.render("edit-post", {
        pageTitle: "Edit Post",
        path: "/writer/edit-post",
        editing: true,
        post: post,
        categoryName: category.categoryName,
      });
    } catch (err) {
      const error = new Error(err.message || "Failed to fetch post");
      error.statusCode = 500;
      next(error);
    }
  },
  postEditPost: async (req, res, next) => {
    const newTitle = req.body.title;
    const newContent = req.body.content;
    const newCategoryName = req.body.categoryName;

    const postId = req.body.postId;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        req.flash("error", "Post not found");
        return res.status(404).redirect("/writer");
      }

      // const category = await Category.findOne({ categoryName: categoryName });
      const newCategory = await Category.findOne({
        categoryName: newCategoryName,
      });

      if (!newCategory) {
        req.flash("error", "Category not found");
        return res.status(404).redirect("/writer");
      }

      post.title = newTitle;
      post.content = newContent;
      post.category = newCategory;

      await post.save();

      req.flash("success", "Updated post successfully!");
      return res.status(200).redirect("/writer");
    } catch (err) {
      const error = new Error(err);
      error.statusCode = 500;
      next(error);
    }
  },
  getPost: (req, res, next) => {
    res.render("writer-post-detail", {
      pageTitle: "Post",
      path: "/writer/posts",
    });
  },
};

export default writerController;
