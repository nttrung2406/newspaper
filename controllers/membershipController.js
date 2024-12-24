import { render } from 'ejs';
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
import mongoose from "mongoose";

export const getMembershipPostById = async (req, res) => {
    try {
       const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("Invalid ID format");
            return res.status(400).render('errorPage', { error: 'Invalid ID format' });
        }
        const post = await Membership.findById(id);
        console.log("Membership:", post);
        if (!post) {
            console.log(`Post with id ${id} not found`);
            return res.status(404).render('errorPage', { error: `Post with id ${id} not found` });
        }
        else {
            console.log("Post found");
            res.render('details', { post });
        }
    } catch (error) {
        console.error("Error in getMembershipPostById;", error.message);
        throw error;
    }
} 