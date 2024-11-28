const writerController = {
  getEditPost: (req, res, next) => {
    res.render("edit-post", {
      pageTitle: "Edit Post",
      path: "writer/edit-post",
    });
  },
  postEditPost: (req, res, next) => {
    const { title, detail, category, tags } = req.body;
    console.log(title, detail, category, tags);
  },
};

export default writerController;
