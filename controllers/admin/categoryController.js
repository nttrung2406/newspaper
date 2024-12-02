
import Category from "../../models/Category.js";

  
const getCategories = async(req, res, next) =>{
    try {
        const {page = 1, search =''} = req.query;
        const limit = 10
        const skip = (page-1) * limit;

        const query = search ? {categoryName: new RegExp(search, 'i')} :{};

        const [categories, total] = await Promise.all([
          Category.find(query).skip(skip).limit(limit).sort({createAt:-1})
          .populate({path: "parentID", select: "categoryName", model: "Category"}),
          Category.countDocuments(query),
        ]);


        //console.log(categories)

        const message = req.flash('category_create_success')
        res.render('admin/category/category_list',{
          categories, currentPage: parseInt(page, 10), totalPages: Math.ceil(total/limit), search, message
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
};

async function getParentID() {
  try {
    const parentCategories = await Category.find({ parentID: null }).select("categoryName");

    if (!parentCategories || parentCategories.length === 0) {
      throw new Error("No parent categories found");
    }

    return parentCategories;
  } catch (error) {
    console.error("Error fetching parent categories:", error.message);
    throw new Error("Error fetching parent categories: " + error.message);
  }
}

const addCategory = async (req, res, next) => {
    try {
    const { categoryName, description, parentName} = req.body;

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      req.flash('category_create_err', "Tên chuyên mục đã tồn tại")
      return res.redirect('/admin/category/create')
    }
    
    let parentID = null;
    if (parentName && parentName !== ''){
      const parentCategory = await Category.findOne({categoryName: parentName});
      if (parentCategory)
      {
        parentID = parentCategory._id
      }
      else{
        throw new Error('Parent category not found')
      }
    }
    

    await Category.create({
      categoryName: categoryName,
      description: description,
      parentID: parentID,
    })

    req.flash('category_create_success',"Chuyên mục đã được thêm thành công!!!")
    res.redirect('/admin/categories');
    
    } catch (error) {
      console.error("Error adding category:", error.message);
      res.status(500).json({ message: "Server error: " + error.message });
    }
};

const updateCategory = async (req, res, next) => {
    try {
      const { id } = req.params; 
      const { categoryName, description, parent } = req.body;  
  
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
    
      const existingCategory = await Category.findOne({ categoryName, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({ message: "Category name already exists" });
      }
  

      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(400).json({ message: "Parent category does not exist" });
        }
      }
  

      const updatedCategory = await Category.findByIdAndUpdate(
        id, 
        { categoryName, description, parent: parent || null, updatedAt: Date.now() },
        { new: true }  
      );
  
      res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
      next();
    } catch (error) {
      console.error("Error updating category:", error.message);
      res.status(500).json({ message: "Server error: " + error.message });
    }
};
  


export default {getCategories, getParentID, addCategory};