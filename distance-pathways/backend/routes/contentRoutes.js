const express = require("express");
const asyncHandler = require("express-async-handler");
const Content = require("../models/Content");
const Settings = require("../models/Settings");
const {
  protect,
  authorize,
  checkTeacherPermission,
} = require("../middleware/auth");

const router = express.Router();

// Maps content type -> feature flag key used for access control
const FEATURE_BY_TYPE = {
  video: "videoLibrary",
  notes: "notesLibrary",
  questionPaper: "questionPapers",
};

const PERMISSION_BY_TYPE = {
  video: "canUploadVideos",
  notes: "canUploadNotes",
  questionPaper: "canUploadQuestionPapers",
};

// @route   GET /api/content
// @desc    List content (videos / notes / question papers), optionally filtered by course or type.
//          fileUrl is hidden for paid items the user hasn't purchased yet.
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { course, type } = req.query;
    const filter = { isPublished: true };
    if (course) filter.course = course;
    if (type) filter.type = type;

    const settings = await Settings.findOne({ singleton: "main" });
    const enabledTypes = Object.entries(FEATURE_BY_TYPE)
      .filter(([, flagKey]) => !settings || settings.featureFlags?.[flagKey] !== false)
      .map(([contentType]) => contentType);
    filter.type = filter.type ? filter.type : { $in: enabledTypes };
    if (filter.type && typeof filter.type === "string" && !enabledTypes.includes(filter.type)) {
      return res.json({ success: true, count: 0, content: [] });
    }

    const items = await Content.find(filter).populate("course", "title university program");

    const purchasedIds = new Set(
      req.user.purchasedContent
        .filter((p) => p.itemType === "content")
        .map((p) => p.item.toString())
    );

    const shaped = items.map((item) => {
      const obj = item.toObject();
      const featureKey = FEATURE_BY_TYPE[item.type];
      const isRestricted = req.user.restrictedFeatures?.includes(featureKey);
      const unlocked =
        req.user.role !== "student" ||
        item.isFree ||
        item.price === 0 ||
        purchasedIds.has(item._id.toString());

      return {
        ...obj,
        locked: !unlocked || isRestricted,
        fileUrl: unlocked && !isRestricted ? obj.fileUrl : undefined,
      };
    });

    res.json({ success: true, count: shaped.length, content: shaped });
  })
);

// @route   GET /api/content/:id
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const item = await Content.findById(req.params.id).populate("course", "title university program");
    if (!item) {
      res.status(404);
      throw new Error("Content not found");
    }

    const settings = await Settings.findOne({ singleton: "main" });
    const featureKey = FEATURE_BY_TYPE[item.type];

    if (settings && settings.featureFlags && settings.featureFlags[featureKey] === false) {
      res.status(403);
      throw new Error("This feature is currently unavailable. Please check back later.");
    }

    if (req.user.role === "student" && req.user.restrictedFeatures?.includes(featureKey)) {
      res.status(403);
      throw new Error("Your account does not have access to this feature. Contact support for help.");
    }

    const purchased = req.user.purchasedContent.some(
      (p) => p.itemType === "content" && p.item.toString() === item._id.toString()
    );
    const unlocked = req.user.role !== "student" || item.isFree || item.price === 0 || purchased;

    const obj = item.toObject();
    if (!unlocked) {
      obj.fileUrl = undefined;
      obj.locked = true;
    }

    res.json({ success: true, content: obj });
  })
);

// @route   POST /api/content
// @desc    Upload new video / notes / question paper (admin, or teacher with permission)
router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  asyncHandler(async (req, res, next) => {
    const { type } = req.body;
    if (!PERMISSION_BY_TYPE[type]) {
      res.status(400);
      throw new Error("Invalid content type");
    }
    return checkTeacherPermission(PERMISSION_BY_TYPE[type])(req, res, next);
  }),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      type,
      course,
      fileUrl,
      previewUrl,
      thumbnail,
      durationMinutes,
      price,
      isFree,
      year,
    } = req.body;

    const content = await Content.create({
      title,
      description,
      type,
      course,
      fileUrl,
      previewUrl,
      thumbnail,
      durationMinutes,
      price: isFree ? 0 : price,
      isFree: !!isFree,
      year,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, content });
  })
);

// @route   PUT /api/content/:id
router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const item = await Content.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Content not found");
    }

    await checkTeacherPermission(PERMISSION_BY_TYPE[item.type])(req, res, () => {});

    Object.assign(item, req.body);
    await item.save();
    res.json({ success: true, content: item });
  })
);

// @route   DELETE /api/content/:id
router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const item = await Content.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Content not found");
    }

    await checkTeacherPermission(PERMISSION_BY_TYPE[item.type])(req, res, () => {});

    await item.deleteOne();
    res.json({ success: true, message: "Content removed" });
  })
);

module.exports = router;
