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
  const limit = 5;
  const skip = (page - 1) * limit;

  if (!query || typeof query !== 'string') {
    return res.status(400).render('errorPage', { error: "Query parameter must be a valid string." });
  }

  try {
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
      const searchFields = Array.isArray(searchBy) ? searchBy : searchBy.split(',');

      searchFields.forEach(field => {
        if (['title', 'abstract', 'content'].includes(field)) {
          searchConditions.push({ [field]: { $regex: query, $options: 'i' } });
        }
      });
    }

    // Combine conditions with OR operator
    const searchQuery = {
      $or: searchConditions,
      status: "Published",  // Only fetch published posts
      publishedDate: { $lte: new Date() }  // Ensure the published date is before now
    };

    const totalResults = await Post.countDocuments(searchQuery);
    const results = await Post.find(searchQuery)
      .populate('category')
      .populate('tags')
      .skip(skip)
      .limit(limit)
      .sort({ premium: -1, createdAt: -1 });

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
      searchBy: Array.isArray(searchBy) ? searchBy : [searchBy].filter(Boolean)
    });

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

    if (!post) {
      console.log(`Post with id ${id} not found`);
      return res.status(404).render("errorPage", { error: `Post with id ${id} not found` });
    }

    post.viewCount += 1;
    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    let imageUrl = null;
    if (post.content) {
      const $ = cheerio.load(post.content);
      const firstImg = $("img").first().attr("src");
      imageUrl = firstImg || null;
    }

    const processedPost = {
      ...post._doc,
      imageUrl,
    };

    const randomPosts = await getRandomPostsByCategory(post.category._id, post._id);

    res.render("details", { 
      post: processedPost,
      category: post.category,
      user: post.writer,
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
      .sort({ createdAt: -1 })
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

