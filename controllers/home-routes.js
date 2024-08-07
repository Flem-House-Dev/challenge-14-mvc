const router = require("express").Router();
const { Blog, User, Comment } = require("../models");
const withAuth = require("../utils/auth");

// -------- Home page --------
router.get("/", async (req, res) => {
  try {
    const dbBlogData = await Blog.findAll({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
      order: [["post_date", "DESC"]],
    });
    const blogs = dbBlogData.map((blog) => blog.get({ plain: true }));

    // Render to view
    res.render("homepage", {
      blogs,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// --------  Blog page --------
router.get("/blog/:id", withAuth, async (req, res) => {
  try {
    const dbBlogData = await Blog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
        {
          model: Comment,
          as: "comments",
          where: {
            blog_id: req.params.id,
          },
          required: false,
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["username"],
            },
          ],
          order: [["post_date", "DESC"]],
        },
      ],

    });

    if (!dbBlogData) {
      res.status(404).json({ message: "No blog found with this id" });
      return;
    }

    const blog = dbBlogData.get({ plain: true });

    // Sort comments in desc order by post_date
    blog.comments.sort((a, b) => new Date(b.post_date) - new Date(a.post_date))

    // This part determins if the logged in user is the author of the comment. 
    blog.comments = blog.comments.map(comment => ({
      ...comment,
      isCommenter: comment.author_id === req.session.user_id
    }));

    // render to view
    res.render("blog-page", {
      blog,
      loggedIn: req.session.loggedIn,
      isAuthor: req.session.user_id === blog.author_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// -------- Dashboard --------

router.get("/dashboard", withAuth, async (req, res) => {
  try {
    const dbBlogData = await Blog.findAll({
      where: { author_id: req.session.user_id,},
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
      order: [["post_date", "DESC"]],
    });
    const blogs = dbBlogData.map((blog) => blog.get({ plain: true }));

    // Render to view
    if (blogs.length === 0) {
      res.render("homepage",{
        blogs: [],
        loggedIn: req.session.loggedIn,
        moBlogsMessage: "You do not have any blogs yet. Start Creating!",
      })
    } else {
      res.render("homepage", {
        blogs,
        loggedIn: req.session.loggedIn,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// -------- New Blog form --------
router.get("/blog-form", withAuth, async (req, res) => {
  try {
    res.render("blog-form", {
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// -------- Update Blog form --------

router.get(`/blog-update/:id`, async (req, res) => {
  try {
    const dbBlogData = await Blog.findByPk(req.params.id);

    if (!dbBlogData) {
      res.status(400).json({ message: "No blog found with this id!" });
      return;
    }

    const blog = dbBlogData.get({ plain: true });

    // Render to view
    res.render("blog-update", {
      blog,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// -------- To Login screen --------
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
    return;
  }

  res.render("login");
});

// -------- To Sign Up screen --------
router.get("/sign-up", (req, res) => {
  res.render("new-user");
});

module.exports = router;
