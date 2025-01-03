import mongoose from 'mongoose';
import Tag from '../../models/Tag.js';
import Post from '../../models/postModel.js'

const viewTagList = async(req, res) =>{
    const {page =1, search =''} = req.query;

    const query = search ? {tagName: new RegExp(search,'i')} : {}
    const limit = 10;
    const skip = (page-1) * limit;

    const [tags, total] = await Promise.all([
        Tag.find(query).skip(skip).limit(limit).sort({updatedAt:-1}),
        Tag.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total/limit);

    const message = req.flash('tag_success')

    res.render('admin/tag/tag_list', {search, tags, currentPage: parseInt(page), totalPages, message})
}


const addTag = async(req, res)=>{
    try {
        const {tagNameAdd} = req.body;
        const existingName = await Tag.findOne({tagName: tagNameAdd});
        //console.log(tagNameAdd);
        if (existingName){
            return res.json({success: false, error: 'Tên nhãn đã tồn tại.'})
        }

       
        await Tag.create({
            tagName: tagNameAdd,
        });

        req.flash("tag_success", 'Nhãn đã được thêm thành công.')
        res.json({success: true})
    } catch (error) {
        console.log('Error adding tag: ', error.message);
        res.status(500).json({message: 'Server error: '+ error.message});
    }


}

const viewTag = async(req, res) =>{
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
    {
        console.log("Invalid ObjectID: ",id)
        return res.status(400).send('Invalid ID format.')
    }

    const tagInformation = await Tag.findById(id)

    if (!tagInformation){
        return res.status(400).send('ID nhãn không tồn tại')
    }
    res.json({success: true,tagInformation})
}



const updateTag = async(req,res) => {
    try {
        const {id} = req.params;
        let {tagNameEdit} =req.body;
        if (!mongoose.Types.ObjectId.isValid(id))
        {
            console.log("Invalid ObjectID: ",id)
            return res.status(400).send('Invalid ID format.')
        }

        const tagInformation = await Tag.findById(id);
        if (!tagInformation){
            return res.status(500).send('ID nhãn không tồn tại')
        }

        const existingTag = await Tag.findOne({
            _id: {$ne: id},
            tagName: tagNameEdit,
        })
        //console.log(existingTag, id)
        if(existingTag){
            
            return res.json({success: false, error: 'Tên nhãn đã tồn tại.'})
        }

        await Tag.findByIdAndUpdate(id,{
            tagName: tagNameEdit,
        })

        req.flash('tag_success','Nhãn đã cập nhật thành công.')
        res.json({success: true})
}
    catch (error){
        console.log("Error updating tag: ", error.message)
        res.status(500).search("Server error: "+ error.message)
    }
}

const deleteTag = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("Invalid ObjectId: ", id);
        return res.status(400).json({ success: false, error: 'Invalid ID format.' });
      }
  
      // Check if the tag exists
      const tagInformation = await Tag.findById(id);
      if (!tagInformation) {
        return res.status(404).json({ success: false, error: 'ID nhãn không tồn tại.' });
      }
  
      // Check if the tag is used in any posts
      const isUsedByPost = await Post.exists({ tags: id });
      if (isUsedByPost) {
        return res.status(400).json({ success: false, error: 'Nhãn này đang được sử dụng bởi bài viết.' });
      }
  
      // Delete the tag
      await Tag.findByIdAndDelete(id);
  
      // Flash message and response
      req.flash('tag_success', 'Nhãn đã xóa thành công.');
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tag: ", error.message);
      res.status(500).json({ success: false, error: "Server error: " + error.message });
    }
  };
  

export default {
    viewTagList,
    addTag,
    viewTag,
    updateTag,
    deleteTag
}