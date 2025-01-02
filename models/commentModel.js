import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'User'
    },
    content: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;