import Membership from '../models/Membership.js';

export const getMembership = async (req, res) => {
    try {
        const memberships = await Membership.find();
        return memberships; // Chỉ trả về dữ liệu
    } catch (error) {
        console.error("Error in getCategory:", error.message);
        throw error;
    }
};