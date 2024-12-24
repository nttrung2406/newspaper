import Post from "../models/postModel.js";
import Category from "../models/Category.js";

export const renderHomePage = async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find();
    const categories = await Category.find({ parentID: { $ne: null } });

    // Process the posts to extract images from content
    const processedPosts = posts.map((post) => {
      let imageUrl = null;
      const imageMatch = post.content.match(
        /\[IMAGE\s*:\s*(https?:\/\/[^\]]+)\]/i
      );

      if (imageMatch) {
        imageUrl = imageMatch[1]; // Get the URL from the match
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
