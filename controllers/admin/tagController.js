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



    res.render('admin/tag/tag_list', {search, tags, currentPage: parseInt(page), totalPages})
}


export default {
    viewTagList
}