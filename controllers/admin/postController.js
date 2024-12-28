import mongoose from "mongoose";
import Post from "../../models/postModel.js"
import Category from "../../models/Category.js";
import UserInformation from "../../models/UserInformation.js";

const getPostList = async (req, res) => {
    try {
        const {page, search} = req.query;
        const limit = 10;
        const currentPage = parseInt(page) || 1;
        console.log(search)
        const query = search ? {tittle: new RegExp(search, 'i')} :{};

        const [postList, totalItem] = await Promise.all([
            Post.find(query)
            .limit(limit)
            .skip((currentPage - 1) * limit)
            .populate({
            path: "category",
            populate:{
                path: "parentID",
                select: "categoryName"
                    }
            }),
            Post.countDocuments(query)
        ]) 

        for (let post of postList) {
            if (post.writer)
            {
                const ret = await UserInformation.findOne({accountID: post.writer});
                post["penName"] = ret ? ret.penName : "";
            }
        }
        
        //console.log(postList[0],  postList[0].penName);
        res.render("admin/post/post_list", {
            postList: postList,
            search: search,
            limit: limit,
            currentPage: currentPage,
            totalPages: Math.ceil(totalItem / limit),
        })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default { getPostList };