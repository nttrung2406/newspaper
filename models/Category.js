import mongoose from 'mongoose';

const categoriesSchema = new mongoose.Schema(
  {
    categoryName: String,
    description: String,
    parentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categoriesSchema);
export default Category;