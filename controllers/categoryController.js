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
          messages: req.flash()
      });

  } catch (error) {
      console.error("Error fetching categories:", error.message);
      res.status(500).send("Internal Server Error");
  }
};

export const getIndex = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    // Fetch the first 4 posts for each category
    const categoriesWithPosts = await Promise.all(
      categories.map(async (category) => {
        const posts = await Post.find({ category: category._id })
          .limit(4)
          .lean();
        return { ...category, posts };
      })
    );

    // Render 'index' view
    res.render('index', { categories: categoriesWithPosts });
  } catch (error) {
    console.error('Error fetching categories or posts:', error.message);
    res.status(500).send('Internal Server Error');
  }
};