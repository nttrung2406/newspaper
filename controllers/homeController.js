import Post from "../models/postModel.js";
import Category from "../models/Category.js";
import * as cheerio from "cheerio"; // Import cheerio for HTML parsing

export const renderHomePage = async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find().populate('category').populate('tags');
    const categories = await Category.find({ parentID: { $ne: null } });

    // Process the posts to extract images from content using cheerio
    const processedPosts = posts.map((post) => {
      let imageUrl = null;

      if (post.content) {
        const $ = cheerio.load(post.content); // Load the content as HTML
        const firstImg = $("img").first().attr("src"); // Get the `src` attribute of the first <img>
        imageUrl = firstImg || null; // Assign the URL or leave null if no <img> tag exists
      }

      return {
        ...post._doc, // Include all other properties of the post
        imageUrl, // Add the extracted image URL (or null if none found)
      };
    });

    // Pass the processed posts with the image URLs to the index.ejs file
    res.render("index", { posts: processedPosts, categories: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
