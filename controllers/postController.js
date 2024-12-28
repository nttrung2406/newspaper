import Post from '../models/postModel.js';
import Membership from '../models/Membership.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
      const newPost = new Post(req.body);
      await newPost.save();
      res.status(201).json(newPost);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

export const getPostsData = async (req, res) => {
    try {
        const posts_data = await Post.find();
        return posts_data; // Chỉ trả về dữ liệu
    } catch (error) {
        console.error("Error in posts_data;", error.message);
        throw error;
    }
  };

export const getPosts = async (req, res) => {
  try {
      const posts = await Post.find().populate('category');
    //   res.status(200).json(posts);
      res.render('index', { posts });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
      const { id } = req.params;
      const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(updatedPost);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
      const { id } = req.params;
      await Post.findByIdAndDelete(id);
      res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

export const searchPostsByTitle = async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
      return res.status(400).render('errorPage', { error: "Query parameter must be a valid string." });
  }

  try {
      const results = await Post.find({ title: { $regex: query, $options: 'i' } });
      res.render('searchResult', { query, results }); // Pass 'results' and 'query'
  } catch (error) {
      res.status(500).render('errorPage', { error: error.message });
  }
};

export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        // Populate toàn bộ các trường của category và writer
        const post = await Post.findById(id).populate('category').populate('writer');

        if (!post) {
            console.log(`Post with id ${id} not found`);
            return res.status(404).render('errorPage', { error: `Post with id ${id} not found` });
        }
        // Truyền đầy đủ thông tin category và writer vào view
        res.render('details', { 
            post,
            category: post.category,
            user: post.writer
        });
    } catch (error) {
        res.status(500).render('errorPage', { error: error.message });
    }
};


const getPostByCategory = async (req, res) => {
    try {
        const { category, page } = req.query;
        const currentPage = parseInt(page) || 1;
        const limit = 10;
        const skip = (currentPage - 1) * limit;
        console.log("category:",category);
        console.log("currentPage:",currentPage);
        // Query bài viết theo category
        const posts = await Post.find({ category })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ category });

        res.json({
            posts,
            totalPosts,
            currentPage,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
}
export default getPostByCategory;