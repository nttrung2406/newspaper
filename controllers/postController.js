import Post from '../models/postModel.js';
import Membership from '../models/Membership.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import * as cheerio from "cheerio"; // Import cheerio for HTML parsing

export const createPost = async (req, res) => {
  try {
      const newPost = new Post(req.body);
      await newPost.save();
      res.status(201).json(newPost);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

export const getPostsData = async (req, res) => {
    try {
        const posts_data = await Post.find();
        return posts_data; // Chỉ trả về dữ liệu
    } catch (error) {
        console.error("Error in posts_data;", error.message);
        throw error;
    }
  };

export const getPosts = async (req, res) => {
  try {
      const posts = await Post.find().populate('category');
    //   res.status(200).json(posts);
      res.render('index', { posts });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
      const { id } = req.params;
      const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(updatedPost);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
      const { id } = req.params;
      await Post.findByIdAndDelete(id);
      res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// export const searchPostsByTitle = async (req, res) => {
//   const { query } = req.query;

//   if (!query || typeof query !== 'string') {
//       return res.status(400).render('errorPage', { error: "Query parameter must be a valid string." });
//   }

//   try {
//       const results = await Post.find({ title: { $regex: query, $options: 'i' } });
//       res.render('searchResult', { query, results }); // Pass 'results' and 'query'
//   } catch (error) {
//       res.status(500).render('errorPage', { error: error.message });
//   }
// };

export const searchPostsByTitle = async (req, res) => {
  const { query, page = 1, searchBy = [] } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;

  if (!query || typeof query !== 'string') {
    return res.status(400).render('errorPage', { error: "Query parameter must be a valid string." });
  }

  try {
    // Build search conditions based on selected checkboxes
    let searchConditions = [];
    
    // If no checkboxes or all checkboxes selected, do full-text search
    if (!searchBy.length || 
        (Array.isArray(searchBy) && searchBy.length === 3) || 
        searchBy === 'title,abstract,content') {
      searchConditions = [
        { title: { $regex: query, $options: 'i' } },
        { abstract: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ];
    } else {
      // Convert to array if single value
      const searchFields = Array.isArray(searchBy) ? searchBy : searchBy.split(',');

      // Add conditions for each selected field
      searchFields.forEach(field => {
        if (['title', 'abstract', 'content'].includes(field)) {
          searchConditions.push({ [field]: { $regex: query, $options: 'i' } });
        }
      });
    }

    // Combine conditions with OR operator
    const searchQuery = { $or: searchConditions };

    // Get total count for pagination
    const totalResults = await Post.countDocuments(searchQuery);

    // Execute search with pagination and sort posts with premium first
    const results = await Post.find(searchQuery)
      .populate('category')
      .populate('tags')
      .skip(skip)
      .limit(limit)
      .sort({ premium: -1, createdAt: -1 }); // Sort by premium (desc) and then createdAt (desc)

    // Process posts to include first image and category name
    const postsWithImages = results.map(post => {
      const $ = cheerio.load(post.content);
      const firstImage = $('img').first().attr('src');
      return {
        ...post.toObject(),
        firstImage: firstImage,
        categoryName: post.category ? post.category.categoryName : 'Uncategorized'
      };
    });

    const totalPages = Math.ceil(totalResults / limit);

    res.render('searchResult', {
      query,
      results: postsWithImages,
      currentPage: parseInt(page, 10),
      totalPages,
      searchBy: Array.isArray(searchBy) ? searchBy : [searchBy].filter(Boolean) // Ensure searchBy is always an array
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('errorPage', { error: "An error occurred while searching. Please try again." });
  }
};




export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the post and populate category, writer, and tags
    const post = await Post.findById(id)
      .populate("category")  // Populate category
      .populate("writer")    // Populate writer
      .populate("tags");     // Populate tags

    if (!post) {
      console.log(`Post with id ${id} not found`);
      return res.status(404).render("errorPage", { error: `Post with id ${id} not found` });
    }

    post.viewCount += 1; // Increment the view count
    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Use cheerio to extract the first image from the post's content
    let imageUrl = null;
    if (post.content) {
      const $ = cheerio.load(post.content); // Load the post's content as HTML
      const firstImg = $("img").first().attr("src"); // Extract the `src` attribute of the first <img>
      imageUrl = firstImg || null; // Assign the URL or leave null if no <img> tag exists
    }

    // Add the extracted image URL to the post object
    const processedPost = {
      ...post._doc, // Spread the existing post fields
      imageUrl,     // Include the extracted image URL
    };

    // Fetch random posts from the same category
    const randomPosts = await getRandomPostsByCategory(post.category._id, post._id);

    // Pass full details including category, writer, tags, and random posts to the view
    res.render("details", { 
      post: processedPost, // Use the processed post with the image URL
      category: post.category,
      user: post.writer,
      tags: post.tags,      // Include tags in the view
      randomPosts,
    });
  } catch (error) {
    res.status(500).render("errorPage", { error: error.message });
  }
};


  const getPostByCategory = async (req, res) => {
    try {
        const { category, page } = req.query;
        const currentPage = parseInt(page) || 1;
        const limit = 10;
        const skip = (currentPage - 1) * limit;

        console.log("category:", category);
        console.log("currentPage:", currentPage);

        // Query bài viết theo category
        const posts = await Post.find({ category })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Process posts to extract the first image using Cheerio
        const processedPosts = posts.map((post) => {
            let imageUrl = null;

            if (post.content) {
                const $ = cheerio.load(post.content); // Load the content as HTML
                const firstImg = $("img").first().attr("src"); // Extract the `src` of the first <img>
                imageUrl = firstImg || null; // Assign the extracted URL or null if no image is found
            }

            return {
                ...post._doc, // Include all other properties of the post
                imageUrl, // Add the extracted image URL (or null if none found)
            };
        });

        const totalPosts = await Post.countDocuments({ category });

        res.json({
            posts: processedPosts, // Return the posts with the extracted image URLs
            totalPosts,
            currentPage,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
}

export default getPostByCategory;

export const getRandomPostsByCategory = async (categoryId, postId) => {
    try {
      // Fetch random posts excluding the current post
      const posts = await Post.aggregate([
        { $match: { category: categoryId, _id: { $ne: postId } } }, // Exclude the current post
        { $sample: { size: 5 } }, // Fetch 5 random posts
      ]);
  
      // Process each post to extract the first image using cheerio
      const processedPosts = posts.map((post) => {
        let imageUrl = null;
  
        if (post.content) {
          const $ = cheerio.load(post.content); // Load the content as HTML
          const firstImg = $("img").first().attr("src"); // Extract the `src` of the first <img>
          imageUrl = firstImg || null; // Assign the extracted URL or null
        }
  
        return {
          ...post, // Include all other fields of the post
          imageUrl, // Add the extracted image URL
        };
      });
  
      return processedPosts;
    } catch (error) {
      console.error("Error fetching random posts by category:", error.message);
      throw error;
    }
  };
