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
      const categories = await Category.find().lean();
      console.log('Categories:', categories);  // Check what categories are returned
      res.render('index', { categories });
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
