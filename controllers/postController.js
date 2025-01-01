import Post from '../models/postModel.js';
import UserInformation from '../models/UserInformation.js';
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
    console.log("run")
    console.log(posts);
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
  const SCORE_THRESHOLD = 1.5;
  const TOP_POSTS_LIMIT = 20; // Reduced to 20 posts
  const POSTS_PER_PAGE = 5;
  const skip = (page - 1) * POSTS_PER_PAGE;

  if (!query || typeof query !== 'string') {
    return res.status(400).render('errorPage', { error: "Query parameter must be a valid string." });
  }

  try {
    let searchQuery = {
      status: "Published",
      publishedDate: { $lte: new Date() }
    };

    if (!searchBy.length || 
        (Array.isArray(searchBy) && searchBy.length === 3) || 
        searchBy === 'title,abstract,content') {
      
      searchQuery.$text = { 
        $search: query,
        $caseSensitive: false,
        $diacriticSensitive: false
      };

      // Two-stage approach: First get top 20 by score, then sort by premium
      const topResults = await Post.aggregate([
        { $match: searchQuery },
        { 
          $addFields: {
            score: { $meta: "textScore" }
          }
        },
        { 
          $match: {
            score: { $gte: SCORE_THRESHOLD }
          }
        },
        {
          $sort: {
            score: -1  // First sort by score to get top 20
          }
        },
        {
          $limit: TOP_POSTS_LIMIT
        },
        {
          $sort: {
            premium: -1,  // Then sort by premium within top 20
            score: -1    // Maintain score order within premium groups
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags'
          }
        },
        {
          $addFields: {
            category: { $arrayElemAt: ["$category", 0] }
          }
        }
      ]);

      const totalResults = topResults.length;
      const paginatedResults = topResults.slice(skip, skip + POSTS_PER_PAGE);

      const postsWithImages = paginatedResults.map(post => {
        const $ = cheerio.load(post.content);
        const firstImage = $('img').first().attr('src');
        return {
          ...post,
          firstImage,
          categoryName: post.category ? post.category.categoryName : 'Uncategorized',
          searchScore: post.score.toFixed(2)
        };
      });

      return res.render('searchResult', {
        query,
        results: postsWithImages,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalResults / POSTS_PER_PAGE),
        searchBy: Array.isArray(searchBy) ? searchBy : [searchBy].filter(Boolean),
        threshold: SCORE_THRESHOLD,
        totalResults
      });
    } else {
      // Specific field search with regex - limited to top 20 and premium priority
      const searchFields = Array.isArray(searchBy) ? searchBy : searchBy.split(',');
      const searchConditions = searchFields.map(field => {
        if (['title', 'abstract', 'content'].includes(field)) {
          return { [field]: { $regex: query, $options: 'i' } };
        }
      }).filter(Boolean);
      
      searchQuery.$or = searchConditions;

      const results = await Post.find(searchQuery)
        .populate('category')
        .populate('tags')
        .limit(TOP_POSTS_LIMIT)
        .sort({ premium: -1, createdAt: -1 }) // Sort by premium after limiting to top 20
        .exec();

      const totalResults = Math.min(TOP_POSTS_LIMIT, results.length);
      const paginatedResults = results.slice(skip, skip + POSTS_PER_PAGE);

      const postsWithImages = paginatedResults.map(post => {
        const $ = cheerio.load(post.content);
        const firstImage = $('img').first().attr('src');
        return {
          ...post.toObject(),
          firstImage,
          categoryName: post.category ? post.category.categoryName : 'Uncategorized'
        };
      });

      return res.render('searchResult', {
        query,
        results: postsWithImages,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalResults / POSTS_PER_PAGE),
        searchBy: Array.isArray(searchBy) ? searchBy : [searchBy].filter(Boolean),
        totalResults
      });
    }

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('errorPage', { error: "An error occurred while searching. Please try again." });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;
    const post = await Post.findOne({
      _id: id,
      status: "Published",  // Ensure the post is published
      publishedDate: { $lte: new Date() }  // Ensure the published date is before now
    })
      .populate("category")
      .populate("writer")
      .populate("tags");
    
    const writerId = post.writer._id;
    const userInfo = await UserInformation.findOne({ accountID: writerId });
    const penName = userInfo.penName;

    if (!post) {
      console.log(`Post with id ${id} not found`);
      return res.status(404).render("errorPage", { error: `Post with id ${id} not found` });
    }

    post.viewCount += 1;
    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    const randomPosts = await getRandomPostsByCategory(post.category._id, post._id);

    res.render("details", { 
      post: post,
      category: post.category,
      penName: penName,
      tags: post.tags,
      randomPosts,
      currentUser: user,
    });
  } catch (error) {
    res.status(500).render("errorPage", { error: error.message });
  }
};


const getPostByCategory = async (req, res) => {
  try {
    const { category, page } = req.query;
    const currentPage = parseInt(page) || 1;
    const limit = 6;
    const skip = (currentPage - 1) * limit;

    const posts = await Post.find({
      category,
      status: "Published",  // Only fetch published posts
      publishedDate: { $lte: new Date() }  // Ensure the published date is before now
    })
      .sort({premium: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "categoryName")
      .populate("tags", "tagName");

    const processedPosts = posts.map((post) => {
      let imageUrl = null;

      if (post.content) {
        const $ = cheerio.load(post.content);
        const firstImg = $("img").first().attr("src");
        imageUrl = firstImg || null;
      }
      console.log(post.tags.map(tag => tag.tagName));
      const tagNames = post.tags && post.tags.length > 0
        ? post.tags.map(tag => tag.tagName).join(', ')
        : 'Không có thẻ';
      return {
        ...post._doc,
        imageUrl,
        categoryId: post.category._id,  // Include category ID
        categoryName: post.category.categoryName,  // Include category name
        tagNames   // Include tag names
      };
    });

    const totalPosts = await Post.countDocuments({ category, status: "Published", publishedDate: { $lte: new Date() } });

    res.json({
      posts: processedPosts,
      totalPosts,
      currentPage,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};


export default getPostByCategory;

export const getRandomPostsByCategory = async (categoryId, postId) => {
  try {
    const posts = await Post.aggregate([
      { $match: { 
        category: categoryId, 
        _id: { $ne: postId },
        status: "Published",  // Only fetch published posts
        publishedDate: { $lte: new Date() }  // Ensure the published date is before now
      } },
      { $sample: { size: 5 } },
    ]);

    const processedPosts = posts.map((post) => {
      let imageUrl = null;

      if (post.content) {
        const $ = cheerio.load(post.content);
        const firstImg = $("img").first().attr("src");
        imageUrl = firstImg || null;
      }

      return {
        ...post,
        imageUrl,
      };
    });

    return processedPosts;
  } catch (error) {
    console.error("Error fetching random posts by category:", error.message);
    throw error;
  }
};

