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
  rejectionReason: { type: String }, // Reason for rejection (if rejected)
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Category of the article
  tags: [String], // Tags associated with the article
  createdAt: { type: Date }, // When the article is scheduled to be published
  updatedAt: { type: Date }, // When the article's details are updated
}, 
{
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the model
const Post = mongoose.model('Post', postSchema);

export default Post;
