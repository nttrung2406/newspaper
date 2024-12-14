import Category from '../models/Category.js';

export const getCategory = async (req, res) => {
    try {
        const categories = await Category.find(); // Truy xuất danh mục từ database
        return categories; // Chỉ trả về dữ liệu
    } catch (error) {
        console.error("Error in getCategory:", error.message);
        throw error; // Ném lỗi để xử lý ở nơi khác
    }
};

