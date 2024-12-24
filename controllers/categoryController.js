import Category from '../models/Category.js';
import Membership from '../models/Membership.js';
import { getPostsData } from './postController.js';

export const getCategory = async (req, res) => {
    try {
      const categories = await Category.find();
      const memberships = await Membership.find();
      const posts= await getPostsData(req,res);
      res.render("categori", {
          freeCategories: categories,
          posts,
          memberships,
          isPremium: false, // xử lí premium
      });

  } catch (error) {
      console.error("Error fetching categories:", error.message);
      res.status(500).send("Internal Server Error");
  }
};
