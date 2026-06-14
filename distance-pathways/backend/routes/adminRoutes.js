const express = require("express");
const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");
const User = require("../models/User");
const Order = require("../models/Order");
const Course = require("../models/Course");
const Content = require("../models/Content");
const ProjectRequest = require("../models/ProjectRequest");
const Page = require("../models/Page");
const upload = require("../utils/upload");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All admin routes require an authenticated admin
router.use(protect, authorize("admin"));

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ singleton: "main" });
  if (!settings) settings = await Settings.create({ singleton: "main" });
  return settings;
};

// @route   GET /api/admin/settings
router.get(
  "/settings",
  asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ success: true, settings });
  })
);

// @route   PUT /api/admin/settings
// @desc    Update site name, tagline, colors, supported universities, contact info
router.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    const { siteName, tagline, primaryColor, accentColor, supportedUniversities, contactEmail, contactPhone } =
      req.body;

    if (siteName !== undefined) settings.siteName = siteName;
    if (tagline !== undefined) settings.tagline = tagline;
    if (primaryColor !== undefined) settings.primaryColor = primaryColor;
    if (accentColor !== undefined) settings.accentColor = accentColor;
    if (supportedUniversities !== undefined) settings.supportedUniversities = supportedUniversities;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;

    await settings.save();
    res.json({ success: true, settings });
  })
);

// @route   PUT /api/admin/settings/logo
// @desc    Upload / replace the app logo
router.put(
  "/settings/logo",
  upload.single("logo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No logo file uploaded");
    }
    const settings = await getOrCreateSettings();
    settings.logoUrl = `/uploads/logo/${req.file.filename}`;
    await settings.save();
    res.json({ success: true, logoUrl: settings.logoUrl, settings });
  })
);

// @route   PUT /api/admin/settings/features
// @desc    Toggle global feature flags (video library, notes, papers, project services, etc.)
router.put(
  "/settings/features",
  asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    settings.featureFlags = { ...settings.featureFlags.toObject(), ...req.body };
    await settings.save();
    res.json({ success: true, featureFlags: settings.featureFlags });
  })
);

// @route   GET /api/admin/users
// @desc    List all users (with optional role filter)
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  })
);

// @route   PUT /api/admin/users/:id/role
// @desc    Promote/demote a user's role
router.put(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!["student", "teacher", "admin"].includes(role)) {
      res.status(400);
      throw new Error("Invalid role");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    user.role = role;
    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  })
);

// @route   PUT /api/admin/users/:id/teacher-permissions
// @desc    Restrict / grant specific features to a specific teacher
router.put(
  "/users/:id/teacher-permissions",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role !== "teacher") {
      res.status(400);
      throw new Error("Permissions can only be set for teacher accounts");
    }

    user.teacherPermissions = { ...user.teacherPermissions.toObject(), ...req.body };
    await user.save();
    res.json({ success: true, teacherPermissions: user.teacherPermissions });
  })
);

// @route   PUT /api/admin/users/:id/restricted-features
// @desc    Restrict specific features (video library, notes, project services etc.) for a specific student
router.put(
  "/users/:id/restricted-features",
  asyncHandler(async (req, res) => {
    const { restrictedFeatures } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role !== "student") {
      res.status(400);
      throw new Error("Feature restrictions can only be set for student accounts");
    }

    user.restrictedFeatures = restrictedFeatures || [];
    await user.save();
    res.json({ success: true, restrictedFeatures: user.restrictedFeatures });
  })
);

// @route   PUT /api/admin/users/:id/status
// @desc    Activate / deactivate a user account
router.put(
  "/users/:id/status",
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    user.isActive = !!isActive;
    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  })
);

// @route   GET /api/admin/dashboard
// @desc    Quick overview stats for the admin dashboard
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [totalStudents, totalTeachers, totalCourses, totalContent, pendingRequests, revenueAgg] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        Course.countDocuments(),
        Content.countDocuments(),
        ProjectRequest.countDocuments({ status: { $in: ["pending", "quoted"] } }),
        Order.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
      ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalContent,
        pendingRequests,
        totalRevenue: revenueAgg[0]?.total || 0,
        totalOrders: revenueAgg[0]?.count || 0,
      },
    });
  })
);

// ----------------------------------------------------------------------
// Site content (homepage hero text, stats, testimonials) - no-code editing
// ----------------------------------------------------------------------

// @route   GET /api/admin/site-content
router.get(
  "/site-content",
  asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    res.json({ success: true, siteContent: settings.siteContent });
  })
);

// @route   PUT /api/admin/site-content
// @desc    Update homepage hero text, stats and testimonials
router.put(
  "/site-content",
  asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    const { hero, stats, testimonials } = req.body;

    if (hero !== undefined) {
      settings.siteContent.hero = { ...settings.siteContent.hero.toObject(), ...hero };
    }
    if (stats !== undefined) settings.siteContent.stats = stats;
    if (testimonials !== undefined) settings.siteContent.testimonials = testimonials;

    await settings.save();
    res.json({ success: true, siteContent: settings.siteContent });
  })
);

// ----------------------------------------------------------------------
// Pages CMS - create/edit/delete custom pages (About Us, Privacy Policy, etc.)
// ----------------------------------------------------------------------

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// @route   GET /api/admin/pages
// @desc    List all pages (including unpublished/drafts)
router.get(
  "/pages",
  asyncHandler(async (req, res) => {
    const pages = await Page.find().sort({ order: 1, title: 1 });
    res.json({ success: true, pages });
  })
);

// @route   POST /api/admin/pages
// @desc    Create a new page
router.post(
  "/pages",
  asyncHandler(async (req, res) => {
    const { title, slug, content, showInNav, showInFooter, order, isPublished } = req.body;

    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }

    const finalSlug = slugify(slug || title);
    const existing = await Page.findOne({ slug: finalSlug });
    if (existing) {
      res.status(400);
      throw new Error(`A page with the URL "/pages/${finalSlug}" already exists. Choose a different title or URL.`);
    }

    const page = await Page.create({
      title,
      slug: finalSlug,
      content: content || "",
      showInNav: !!showInNav,
      showInFooter: showInFooter !== undefined ? !!showInFooter : true,
      order: order || 0,
      isPublished: isPublished !== undefined ? !!isPublished : true,
    });

    res.status(201).json({ success: true, page });
  })
);

// @route   PUT /api/admin/pages/:id
// @desc    Update an existing page
router.put(
  "/pages/:id",
  asyncHandler(async (req, res) => {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404);
      throw new Error("Page not found");
    }

    const { title, slug, content, showInNav, showInFooter, order, isPublished } = req.body;

    if (title !== undefined) page.title = title;

    if (slug !== undefined && slug !== page.slug) {
      const finalSlug = slugify(slug);
      const existing = await Page.findOne({ slug: finalSlug, _id: { $ne: page._id } });
      if (existing) {
        res.status(400);
        throw new Error(`A page with the URL "/pages/${finalSlug}" already exists. Choose a different URL.`);
      }
      page.slug = finalSlug;
    }

    if (content !== undefined) page.content = content;
    if (showInNav !== undefined) page.showInNav = !!showInNav;
    if (showInFooter !== undefined) page.showInFooter = !!showInFooter;
    if (order !== undefined) page.order = order;
    if (isPublished !== undefined) page.isPublished = !!isPublished;

    await page.save();
    res.json({ success: true, page });
  })
);

// @route   DELETE /api/admin/pages/:id
router.delete(
  "/pages/:id",
  asyncHandler(async (req, res) => {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404);
      throw new Error("Page not found");
    }
    await page.deleteOne();
    res.json({ success: true, message: "Page removed" });
  })
);

module.exports = router;
