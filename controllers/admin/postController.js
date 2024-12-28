import mongoose from "mongoose";
import Post from "../../models/postModel.js"
import Category from "../../models/Category.js";
import UserInformation from "../../models/UserInformation.js";


const renderPage = async (req, res) => {
    try {
        const categories = await Category.find({ parentID: { $ne: null } });

        res.render('admin/post/post_list', {
            categories, // Pass categories to the EJS template
            search: req.query.search || '',
            status: req.query.status || '',
            category: req.query.category || '',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





const getPostList = async (req, res) => {
    try {

        const { page = 1, search = '', status = '', category = '' } = req.query;


        const limit = 10;
        const currentPage = parseInt(page);
        const query = {};

        if (search) {
            query.title = new RegExp(search, 'i');
        }
        if (status) {
            query.status = status;
        }
        if (category) {
            query.category = category;
        }

        //console.log(page, search ,status, category)


        const categories = await Category.find({ parentID: { $ne: null } });
        const [postList, totalItem] = await Promise.all([
            Post.find(query)
                .limit(limit)
                .skip((currentPage - 1) * limit)
                .populate({
                    path: "category",
                    populate: {
                        path: "parentID",
                        select: "categoryName"
                    }
                }).sort({ updatedAt: -1 }),
            Post.countDocuments(query)
        ])

        for (let post of postList) {
            if (post.writer) {
                const ret = await UserInformation.findOne({ accountID: post.writer });
                post["penName"] = ret ? ret.penName : "";
            }
        }

        if (postList.length <= 0) {
            const tableHTML = `
                <tr>
                    <td colspan="6" class="text-center">Không tìm thấy bài báo nào</td>
                </tr>
            `

            const paginationHTML = ``
            return res.json({
                table: tableHTML,
                pagination: paginationHTML,
                categories,
                totalPages: 0,
            })
        }

        function badgeClass(status) {
            switch (status) {
                case 'Draft':
                    return 'badge-outline-secondary';
                case 'Submitted':
                    return 'badge-outline-info';
                case 'Approved':
                    return 'badge-outline-success';
                case 'Rejected':
                    return 'badge-outline-danger';
                case 'Published':
                    return 'badge-outline-primary';
                default:
                    return 'badge-outline-dark';
            }
        }



        const tableHTML = postList.map(element => {
            return `
              <tr>
                <td>${element.title}</td>
                <td>${element.penName}</td>
                <td>${element.category.parentID ? element.category.parentID.categoryName + " / " : ""}${element.category.categoryName}</td>
                <td>
                  <span class="badge ${badgeClass(element.status)}">${element.status}</span>
                </td>
                <td>
                  ${element.premium ? "<i class='mdi mdi-check' style='color: green;'></i>" : "<i class='mdi mdi-close' style='color: red;'></i>"}
                </td>
                <td>
                  <button class="btn btn-info btn-icon" data-id="${element._id}" data-toggle="tooltip" data-placement="bottom" title="Xem chi tiết" onclick="openPostDetailModal('${element._id}')">
                    <i class="mdi mdi-eye"></i>
                  </button>
                  <button class="btn btn-warning btn-icon" data-id="${element._id}" data-toggle="tooltip" data-placement="bottom" title="Premium">
                    <i class="mdi mdi-star"></i>
                  </button>
                  <button class="btn btn-primary btn-icon" data-id="${element._id}" data-toggle="tooltip" data-placement="bottom" title="Publish" ${element.status === "Published" ? 'disabled' : ''}>
                    <i class="mdi mdi-checkbox-marked-circle"></i>
                  </button>
                </td>
              </tr>
            `;
        }).join('');

        // Build pagination HTML
        const totalPages = Math.ceil(totalItem / limit);
        const paginationHTML = `
            <ul class="pagination justify-content-center">
              <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">&laquo;</a>
              </li>
              <li class="page-item active">
                <span class="page-link">${currentPage}</span>
              </li>
              <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">&raquo;</a>
              </li>
            </ul>
          `;

        // Return the data
        return res.json({ table: tableHTML, pagination: paginationHTML, categories, totalPages });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const viewPostContent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.json(400).json({ success: false, error: "Invalid ID format." })
        }
        //console.log(id)
        const postContent = await Post.findById(id)
            .populate('writer')
            .populate('category')

        //console.log(postContent)
        if (!postContent) {
            res.json({success: false, error: "Không tìm thấy bài báo"})
        }
        
        const writerInfo = await UserInformation.findOne({accountID: postContent.writer._id})
        //console.log(postContent.writer._id, writerInfo.penName)


        
        res.json({success: true, postContent, writerInfo})
    } catch (error) {
        res.status(500).json({ success: false, error: error })
        console.log("Error fetching post's content", error)
    }
}

export default {
    renderPage,
    getPostList,
    viewPostContent,
};