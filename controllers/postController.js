import Post from '../models/postModel.js';

export const createPost = async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      writer: req.session.user._id
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('writer');
    res.render('posts/index', { posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};
