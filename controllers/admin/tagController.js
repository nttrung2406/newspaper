import mongoose from "mongoose";
import Tag from '../../models/Tag.js';

const viewTagList = async(req, res) =>{
    const {page =1, search =''} = req.query;

    const query = search ? {tagName: new RegExp(search,'i')} : {}
    const limit = 10;
    const skip = (page-1) * limit;

    const [tags, total] = await Promise.all([
        Tag.find(query).skip(skip).limit(limit).sort({createdAt:-1}),
        Tag.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total/limit);

    const message = req.flash('category_create_success')

    res.render('admin/tag/tag_list', {search, tags, currentPage: parseInt(page), totalPages, message})
}


const addTag = async(req, res)=>{
    try {
        const {tagName, description} = req.body;
        const existingName = await Tag.findOne({tagName: tagName});
        console.log(tagName, description);
        if (existingName){
            req.flash('tag_create_err','Tên nhãn đã tồn tại.')
            return res.redirect('/admin/tag/create');
        }

       
        await Tag.create({
            tagName: tagName,
            description: description,
        });

        req.flash("category_create_success", 'Nhãn đã được thêm thành công.')
        res.redirect('/admin/tags')
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

    res.render('admin/tag/tag_info',{tagInformation})
}




export default {
    viewTagList,
    addTag,
    viewTag,
}