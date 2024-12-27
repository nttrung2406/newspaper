import mongoose from "mongoose";
import Post from "../../models/postModel.js"
import Category from "../../models/Category.js";
import UserInformation from "../../models/UserInformation.js";

const getPostList = async (req, res) => {
    try {
        const limit = 1;

        const postList = await Post.find()
        .limit(limit)
        .populate({
            path: "category",
            populate:{
                path: "parentID",
                select: "categoryName"
            }
        });

        for (let post of postList) {
            post["premium"] =false;

            if (post.writer)
            {
                const ret = await UserInformation.findOne({accountID: post.writer});
                post["penName"] = ret ? ret.penName : "";
            }
        }
        
        console.log(postList[0], postList[0].premium, postList[0].penName);
        res.render("admin/post/post_list", {
            postList: postList,
            search: "",
            limit: limit,
            currentPage: 1,
            totalPages: 1,
        })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default { getPostList };