import Post from "../models/postModel.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

const PREVIEW_POST = 3;

const writerController = {
  getWriterPage: async (req, res, next) => {
    try {
      const posts = await Post.find({ writer: req.user._id }).limit(
        PREVIEW_POST
      );
      res.render("writer", {
        pageTitle: "Writer",
        path: "/writer",
        posts: posts,
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
    });
  },
  postAddPost: async (req, res, next) => {
    const { title, detail, categoryName, status } = req.body;
    try {
      const category = await Category.findOne({ categoryName: categoryName });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const post = new Post({
        title: title,
        content: detail,
        status: status,
        writer: req.user._id,
        category: category._id,
      });
      await post.save();

      req.user.writerPosts.push(post._id);
      await req.user.save();

      res.status(201).json({
        message: "Post created successfully",
        post: {
          id: post._id,
          title: post.title,
          content: post.content,
          status: post.status,
          category: post.category,
        },
      });
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
        return res.redirect("/");
      }

      const category = await Category.findById(post.category);

      if (!category) {
        console.log("Category not found for this post");
        return res.redirect("/");
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
    const newDetail = req.body.detail;
    const newCategoryName = req.body.categoryName;

    const postId = req.body.postId;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found!" });
      }

      // const category = await Category.findOne({ categoryName: categoryName });
      const newCategory = await Category.findOne({
        categoryName: newCategoryName,
      });

      if (!newCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      post.title = newTitle;
      post.content = newDetail;
      post.category = newCategory;

      await post.save();

      return res.status(200).json({message: 'Updated post successfully!'});
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
