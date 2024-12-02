
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


        console.log(categories)
        res.render('admin/category/category_list',{
          categories, currentPage: parseInt(page, 10), totalPages: Math.ceil(total/limit), search
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
};

async function getParentID() {
  try {
    const parentCategories = await Category.find({ parent: null });

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
    const { categoryName, description, parent } = req.body;

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category does not exist" });
      }
    }

    const newCategory = await Category.create({
    categoryName,
      description,
      parent: parent || null,
    });

    res.status(201).json({ message: "Category added successfully", category: newCategory });
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
  


export default {getCategories};