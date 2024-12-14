import mongoose from 'mongoose';


const tagSchema = new mongoose.Schema(
  {
    tagName: String,
  },
  {
    timestamps: true
  }
);

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
