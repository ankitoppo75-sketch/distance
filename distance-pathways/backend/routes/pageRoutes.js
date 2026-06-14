const express = require("express");
const asyncHandler = require("express-async-handler");
const Page = require("../models/Page");

const router = express.Router();

// @route   GET /api/pages/:slug
// @desc    Get a single published page by its slug (used to render /pages/:slug)
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) {
      res.status(404);
      throw new Error("Page not found");
    }
    res.json({ success: true, page });
  })
);

module.exports = router;
