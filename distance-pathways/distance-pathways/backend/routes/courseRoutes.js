const express = require("express");
const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const Content = require("../models/Content");
const User = require("../models/User");
const {
  protect,
  optionalAuth,
  authorize,
  checkFeatureAccess,
  checkTeacherPermission,
} = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/courses
// @desc    List all published courses, with optional filters
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { university, program, search } = req.query;
    const filter = { isPublished: true };

    if (university) filter.university = university;
    if (program) filter.program = program;
    if (search) filter.$text = { $search: search };

    const courses = await Course.find(filter)
      .populate("instructor", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  })
);

// @route   GET /api/courses/:id
// @desc    Get single course with its content list (locked/unlocked based on purchase)
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate("instructor", "name avatar");
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    const content = await Content.find({ course: course._id, isPublished: true });

    const purchasedIds = new Set(
      (req.user?.purchasedContent || [])
        .filter((p) => p.itemType === "content")
        .map((p) => p.item.toString())
    );

    const shapedContent = content.map((item) => {
      const obj = item.toObject();
      const unlocked =
        !req.user ||
        req.user.role !== "student" ||
        item.isFree ||
        item.price === 0 ||
        purchasedIds.has(item._id.toString());

      return {
        ...obj,
        locked: !unlocked,
        fileUrl: unlocked ? obj.fileUrl : undefined,
      };
    });

    const isEnrolled = req.user
      ? req.user.enrolledCourses?.some((c) => c.toString() === course._id.toString()) ||
        (course.isFree || course.price === 0)
      : false;

    res.json({ success: true, course, content: shapedContent, isEnrolled });
  })
);

// @route   POST /api/courses
// @desc    Create a new course (admin, or teacher with permission)
router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  checkTeacherPermission("canManageCourses"),
  asyncHandler(async (req, res) => {
    const { title, description, university, program, subject, semester, price, isFree, thumbnail, tags } =
      req.body;

    const course = await Course.create({
      title,
      description,
      university,
      program,
      subject,
      semester,
      price: isFree ? 0 : price,
      isFree: !!isFree,
      thumbnail,
      tags,
      instructor: req.user._id,
    });

    res.status(201).json({ success: true, course });
  })
);

// @route   PUT /api/courses/:id
router.put(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  checkTeacherPermission("canManageCourses"),
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    Object.assign(course, req.body);
    await course.save();

    res.json({ success: true, course });
  })
);

// @route   DELETE /api/courses/:id
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }
    await course.deleteOne();
    res.json({ success: true, message: "Course removed" });
  })
);

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a free course directly (paid courses go through /api/payments)
router.post(
  "/:id/enroll",
  protect,
  checkFeatureAccess("courseEnrollment"),
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    if (!course.isFree && course.price > 0) {
      res.status(400);
      throw new Error("This course requires payment. Use the checkout to enroll.");
    }

    if (!req.user.enrolledCourses.includes(course._id)) {
      req.user.enrolledCourses.push(course._id);
      course.studentsEnrolled += 1;
      await req.user.save();
      await course.save();
    }

    res.json({ success: true, message: "Enrolled successfully", course });
  })
);

module.exports = router;
