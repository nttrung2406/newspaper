import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String},
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Published'], 
    default: 'Draft'
  },
  premium: { type: Boolean, default: false},
  abstract: { type: String, required: true },
  writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  rejectionReason: { type: String }, 
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, 
  publishedDate: {type: Date},
  tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  viewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  createdAt: { type: Date }, 
  updatedAt: { type: Date }, 
}, 
{
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

postSchema.index({ title: 'text', abstract: 'text', content: 'text' });
postSchema.index({ status: 1, publishedDate: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;