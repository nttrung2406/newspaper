
import Category from "../../models/Category.js";
import mongoose from "mongoose";



// Get Category List and Render
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

// Return a list of parent category.
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

// Add a category to database and Go to next page
const addCategory = async (req, res) => {
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


// Get Information of specific category and render
const viewCategory = async(req, res) =>{
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('Invalid ObjectId:', id);
    return res.status(400).send('Invalid ID format');
  }


  const categoryInformation = await Category.findById(id)
    .populate({path: "parentID", select: "categoryName", model: "Category"});
  
  res.render('admin/category/category_info', {categoryInformation});
}

// Get information of specific category for updating and render
const getCategoryForUpdate = async(req, res) =>{
  try{
    const {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
  {
    console.log('Invalid ObjectId:', id);
    res.status(400).send('Invalid ID format');
  }

  const categoryInfo = await Category.findById(id).populate({path: "parentID", select: "categoryName", model: "Category"});

  //console.log(categoryInfo)
  if (!categoryInfo)
  {
    res.status(400).send('ID của chuyên mục không tồn tại.')
  }

  let idList = categoryInfo.parentID ? [categoryInfo.parentID._id, id] : [id]
  //console.log(idList)
  const parentCategories = await Category.find({
    _id: {$nin: idList},
    parentID: null
  })

  const NameErr = req.flash("cateUpNameErr")
  const ParentErr = req.flash("cateUpParentErr")

  res.render("admin/category/category_update", {categoryInfo, parentCategories, id, NameErr, ParentErr})
  }
  catch(error){
    console.log("Error fetching category for update: ", error.message);
    res.status(500).send("Server error: " + error.message)
  }
}

// Update the data of category in the database.
const updateCategory = async (req, res, next) => {
    try {
      const { id } = req.params; 
      let { categoryName, description, parentID } = req.body;  
  
      if (!mongoose.Types.ObjectId.isValid(id))
      {
        console.log("Invalid objectID", id)
        res.status(400).send("Invalid ID format");
      }

      const categoryInfo = await Category.findById(id);
      if (!categoryInfo) {
        return res.status(400).send("ID chuyên mục không tồn tại.");
      }

      const existingCategory = await Category.findOne({categoryName: categoryName,_id: {$ne: id}});
      console.log(existingCategory)
      if (existingCategory)
      {
        req.flash("cateUpNameErr", "Tên chuyên mục đã tồn tại.")
        return res.redirect(`/admin/category/update/${id}`);
      }

      if (parentID === "") {
        parentID = null;
      }

      

      if (categoryInfo.parentID === null && parentID !== null) {
        // Check if it is the parent catergory and has child.
        const hasChildren = await Category.exists({ parentID: id });
        if (hasChildren) {
          req.flash("cateUpParentErr", "Không thể đổi thành chuyên mục con.");
          return res.redirect(`/admin/category/update/${id}`);
        }
      }  
      if (parentID !== null){
        // Validate the new parentID
        const newParentCategory = await Category.findById(parentID);
        if (!newParentCategory) {
          req.flash("cateUpParentErr", "ID không tồn tại");
          return res.redirect(`/admin/category/update/${id}`);
        }
      }

      await Category.findByIdAndUpdate(id, {categoryName: categoryName,
        description: description,
        parentID: parentID
      })


      //check parentID
      req.flash("category_create_success", "Cập nhật chuyên mục thành công.")
      res.redirect("/admin/categories")

    } catch (error) {
      console.error("Error updating category:", error.message);
      res.status(500).json({ message: "Server error: " + error.message });
    }
};
  


export default {getCategories, getParentID, addCategory, viewCategory, getCategoryForUpdate, updateCategory};