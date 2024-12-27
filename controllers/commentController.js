import Comment from '../models/commentModel.js';
import User from '../models/User.js';
import setUserData from '../middlewares/setUserData.js';
export const getCommentsByPostId = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('userId', 'username')  // Lấy trường username từ bảng users
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const addComment = async (req, res) => {
    try {
        if (!req.session.user){
            return res.status(401).json({ error: 'Please log in to comment.', redirect: '/login' });
        }
        const userId = req.session.user._id;
        const { postId, content } = req.body;
        const newComment = new Comment({ postId, userId, content });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};