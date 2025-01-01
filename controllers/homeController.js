import Post from "../models/postModel.js";
import Category from "../models/Category.js";
import * as cheerio from "cheerio"; // Import cheerio for HTML parsing

export const renderHomePage = async (req, res) => {
  try {
    const categories = await Category.find({ parentID: { $ne: null } });

    // Fetch top 3-4 posts from the past week based on view count or other criteria
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const topPostsThisWeek = await Post.find({
      createdAt: { $gte: lastWeek },
      status: "Published", // Only fetch published posts
      publishedDate: { $lte: new Date() } // Ensure the published date is before now
    })
    .sort({ viewCount: -1 })
    .limit(4)
    .populate('category').populate('tags');

    // Fetch top 10 most viewed posts (across all categories)
    const topViewedPosts = await Post.find({
      status: "Published", // Only fetch published posts
      publishedDate: { $lte: new Date() } // Ensure the published date is before now
    })
    .sort({ viewCount: -1 })
    .limit(10)
    .populate('category').populate('tags');

    // Fetch 10 most recent posts
    const recentPosts = await Post.find({
      status: "Published", // Only fetch published posts
      publishedDate: { $lte: new Date() } // Ensure the published date is before now
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('category').populate('tags');

    // Fetch the latest post for each of the top 10 categories
    const topCategoriesWithLatestPost = await Promise.all(
      categories.slice(0, 10).map(async (category) => {
        const latestPost = await Post.findOne({
          category: category._id,
          status: "Published", // Only fetch published posts
          publishedDate: { $lte: new Date() } // Ensure the published date is before now
        })
        .sort({ createdAt: -1 })
        .populate('category').populate('tags');
        return { category, latestPost };
      })
    );

    // Process the posts to extract images from content using cheerio
    const processPost = (post) => {
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
    };

    // Process all relevant posts
    const processedTopPostsThisWeek = topPostsThisWeek.map(processPost);
    const processedTopViewedPosts = topViewedPosts.map(processPost);
    const processedRecentPosts = recentPosts.map(processPost);
    const processedTopCategoriesWithLatestPost = topCategoriesWithLatestPost.map((categoryPost) => {
      return {
        category: categoryPost.category,
        latestPost: categoryPost.latestPost ? processPost(categoryPost.latestPost) : null
      };
    });

    // Pass the processed data to the index.ejs file
    res.render("index", {
      categories: categories,
      topPostsThisWeek: processedTopPostsThisWeek,
      topViewedPosts: processedTopViewedPosts,
      recentPosts: processedRecentPosts,
      topCategoriesWithLatestPost: processedTopCategoriesWithLatestPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
