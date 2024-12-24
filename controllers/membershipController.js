import Membership from '../models/Membership.js';

export const getMembership = async (req, res) => {
    try {
        const memberships = await Membership.find();
        return memberships; // Chỉ trả về dữ liệu
    } catch (error) {
        console.error("Error in getMembership;", error.message);
        throw error;
    }
};

export const getMembershipPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const membership = await Membership.findById(id);
        return membership; // Chỉ trả về dữ liệu
    } catch (error) {
        console.error("Error in getMembershipPostById;", error.message);
        throw error;
    }
}
