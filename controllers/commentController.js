import Comment from '../models/commentModel.js';

export const getCommentsByPostId = async (req, res) => {
    try {
        let userId = null;
        if (req.session.user !== null) {
            userId = req.session.user._id;
        }
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
        // Đính kèm isOwner cho từng bình luận
        if (req.session.user.role === 'admin') {
            const commentsWithOwnership = comments.map(comment => ({
                ...comment.toObject(),
                isOwner: true,
            }));
            res.json(commentsWithOwnership);
            return;
        }
        const commentsWithOwnership = comments.map(comment => ({
            ...comment.toObject(),
            isOwner: comment.userId._id.equals(userId),
        }));

        res.json(commentsWithOwnership);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};


export const addComment = async (req, res) => {
    try {
        if (!req.session.user) {
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

export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.session.user;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }
        console.log(comment.userId._id.equals(user._id));
        // Kiểm tra người dùng có quyền xóa không
        if (!comment.userId._id.equals(user._id) && user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this comment.' });
        }
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete comment.' });
    }
};
