import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], // Approval workflow
    default: 'Draft'
  },
  writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Writer who created the post
  editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Editor who approved/rejected
  rejectionReason: { type: String }, // Optional: Reason for rejection
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

export default Post;
