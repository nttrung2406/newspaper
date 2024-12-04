const writerController = {
  getWriterPage: (req, res, next) => {
    res.render("writer", {
      pageTitle: "Writer",
      path: "/writer",
    });
  },
  getAddPost: (req, res, next) => {
    res.render("edit-post", {
      pageTitle: "Add New Post",
      path: "writer/add-post",
      editing: false,
    });
  },
  postEditPost: (req, res, next) => {
    const { title, detail, category, tags } = req.body;
    console.log(title, detail, category, tags);
  },
  getPosts: (req, res, next) => {
    res.render("writer-posts", {
      pageTitle: "Posts",
      path: "/writer/posts",
    });
  },
  getPost: (req, res, next) => {
    res.render("writer-post-detail", {
      pageTitle: "Posts",
      path: "/writer/posts",
    });
  },
};

export default writerController;
