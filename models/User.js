import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: {
    type: String,
    enum: ['Membership', 'Writer', 'Editor', 'Admin'],
    required: true
  },
  membership: {
    expiryDate: { type: Date }, // For Membership role only
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] // Allowed categories
  },
  writerPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // For Writer role
  editorPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // For Editor role
}, {
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

export default User;
