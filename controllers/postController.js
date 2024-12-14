import Post from '../models/postModel.js';
import Category from '../models/Category.js';

export const getCategory = async (req, res) => {
    try {
        const categories = await Category.find(); // Truy xuất toàn bộ danh mục
        console.log("Fetched Categories:", categories); // Log để kiểm tra dữ liệu
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error in getCategory:", error.message, error.stack);
        res.status(500).json({ error: error.message });
    }
};


export const createPost = async (req, res) => {
  try {
      const newPost = new Post(req.body);
      await newPost.save();
      res.status(201).json(newPost);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
      const posts = await Post.find().populate('category');
      res.status(200).json(posts);
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