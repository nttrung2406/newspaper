
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
          Category.find(query).skip(skip).limit(limit).sort({createdAt:-1})
          .populate({path: "parentID", select: "categoryName", model: "Category"}),
          Category.countDocuments(query),
        ]);


        const parentCategories = await Category.find({ parentID: null }).select("categoryName");

        //console.log(categories)

        const addSuccess = req.flash('category_create_success')
        const updateSuccess = req.flash('category_update_success')
        const deleteSuccess = req.flash('category_delete_success')

        const message = addSuccess.length > 0 ? addSuccess[0] : updateSuccess.length > 0 ? updateSuccess[0] : deleteSuccess.length >0 ? deleteSuccess[0] : "";
        res.render('admin/category/category_list',{
          categories, 
          currentPage: parseInt(page, 10), 
          totalPages: Math.ceil(total/limit),
          search,
          message,
          parentCategories
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
    const { categoryAddName, categoryAddDescription, categoryAddParent} = req.body;

    const existingCategory = await Category.findOne({ categoryAddName });
    if (existingCategory) {
      
      return res.json({success: false, error: "Tên chuyên mục đã tồn tại."});
    }
    
    await Category.create({
      categoryName: categoryAddName,
      description: categoryAddDescription,
      parentID: categoryAddParent === "" ? null : categoryAddParent,
    })

    req.flash('category_create_success',"Chuyên mục đã được thêm thành công!!!")
    res.json({success:true});
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
  if (!categoryInformation){
    return res.json({sucess: false, error: "ID của chuyên mục không tồn tại."})
  }

  //console.log(categoryInformation)
  res.json({success: true, categoryInformation});
}

// Get information of specific category for updating and render
const getCategoryForUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId:', id);
      return res.status(400).send('Invalid ID format');
    }

    const categoryInfo = await Category.findById(id).populate({
      path: "parentID",
      select: "categoryName",
      model: "Category",
    });

    if (!categoryInfo) {
      return res.status(400).send('ID của chuyên mục không tồn tại.');
    }

    // Check if the category has child categories
    const hasChildren = await Category.exists({ parentID: id });
    const isParent = categoryInfo.parentID === null;

    const parentList = await Category.find({
      _id: { $ne: id },
      parentID: null,
    });

    // Generate HTML options
    let parentOptions = parentList
      .map(
        (parent) =>
          `<option value="${parent._id}" ${
            categoryInfo.parentID && categoryInfo.parentID._id.equals(parent._id) ? 'selected' : ''
          }>${parent.categoryName}</option>`
      )
      .join('');

    // Add the "-- None --" option
    const noneOption = `<option value="" ${isParent ? 'selected' : ''}>-- None --</option>`;
    parentOptions = isParent ? noneOption + parentOptions : parentOptions + noneOption;

    res.json({
      success: true,
      categoryInfo,
      parentOptions,
      isParent,
      hasChildren,
    });
  } catch (error) {
    console.log("Error fetching category for update: ", error.message);
    res.status(500).send("Server error: " + error.message);
  }
};


// Update the data of category in the database.
const updateCategory = async (req, res, next) => {
    try {
      const { id } = req.params; 
      let { updateCategoryName, updateCategoryDescription, updateParentID } = req.body;  
  
      if (!mongoose.Types.ObjectId.isValid(id))
      {
        console.log("Invalid objectID", id)
        res.json({success: false, error: "ID không hợp lệ."})
      }

      const categoryInfo = await Category.findById(id);
      if (!categoryInfo) {
        return res.json({success: false, error: "ID của chuyên mục không tồn tại.", isFatal: true});
      }

      const existingCategory = await Category.findOne({categoryName: updateCategoryName,_id: {$ne: id}});
      //console.log(existingCategory)
      if (existingCategory)
      {
        return res.json({success: false, error: "Tên chuyên mục đã tồn tại.", isFatal: false});
      }

      if (updateParentID === "") {
        updateParentID = null;
      }

      

      // if (categoryInfo.parentID === null && parentID !== null) {
      //   // Check if it is the parent catergory and has child.
      //   const hasChildren = await Category.exists({ parentID: id });
      //   if (hasChildren) {
      //     req.flash("cateUpParentErr", "Không thể đổi thành chuyên mục con.");
      //     return res.redirect(`/admin/category/update/${id}`);
      //   }
      // }  
      if (updateParentID !== null){
        // Validate the new parentID
        const newParentCategory = await Category.findById(updateParentID);
        if (!newParentCategory) {
          return res.json({success: false, error: "Chuyên mục cha không tồn tại.", isFatal: false});
        }
      }

      await Category.findByIdAndUpdate(id, {categoryName: updateCategoryName,
         description: updateCategoryDescription, 
         parentID: updateParentID});


      req.flash('category_update_success',"Chuyên mục đã được cập nhật thành công!!!")
      res.json({success: true});

    } catch (error) {
      console.error("Error updating category:", error.message);
      res.status(500).json({ message: "Server error: " + error.message });
    }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('Invalid ObjectId:', id);
    return res.json({success: false, error: "ID không hợp lệ."});
  }

  const categoryInfo = await Category.findById(id);

  if (!categoryInfo) {
    return res.json({success: false, error: "ID của chuyên mục không tồn tại."});
  }

  const hasChildren = await Category.exists({ parentID: id });

  if (hasChildren) {
    return res.json({success: false, error: "Chuyên mục này đang sử dụng"});
  }

  await Category.findByIdAndDelete(id);
  req.flash('category_delete_success',"Chuyên mục đã được xóa thành công!!!")
  res.json({success: true});
}
  


export default {getCategories, 
                getParentID, 
                addCategory,
                 viewCategory, 
                 getCategoryForUpdate, 
                 updateCategory,
                 deleteCategory};