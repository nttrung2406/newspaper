import Post from '../models/postModel.js';

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

// In postController.js

export const searchPostsByTitle = async (req, res) => {
  const { query } = req.query; // Changed from 'title' to 'query'

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: "Query parameter must be a valid string." });
  }

  try {
    const posts = await Post.find({ title: { $regex: query, $options: 'i' } });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
