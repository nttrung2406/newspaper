import mongoose from 'mongoose';


const categoriesSchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  description: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
},{
  timestamps: true,
});



const Category = mongoose.model('Category', categoriesSchema);

export default Category;
