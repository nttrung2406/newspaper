import Category from '../models/Category.js';
import Membership from '../models/Membership.js';
import { getPostsData } from './postController.js';

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find().lean(); // Fetch all categories
    const memberships = await Membership.find().lean();
    const posts = await getPostsData(req, res);

    // Render 'categori' view
    res.render('categori', {
      categories,
      posts,
      memberships,
      isPremium: false, // Handle premium status logic
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

export const getIndex = async (req, res) => {
    try {
      const categories = await Category.find().lean();  // Fetch categories from the database
      const memberships = await Membership.find().lean();
      const posts = await getPostsData(req, res);
  
      // Render the 'index' view and pass categories data
      res.render('index', {
        categories,  // Pass categories to the index view
        posts,
        memberships,
        isPremium: false,
      });
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };
