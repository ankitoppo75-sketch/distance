const express = require("express");
const asyncHandler = require("express-async-handler");
const ProjectRequest = require("../models/ProjectRequest");
const {
  protect,
  authorize,
  checkFeatureAccess,
  checkTeacherPermission,
} = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/project-requests
// @desc    Student submits a request for synopsis / project / research paper help
router.post(
  "/",
  protect,
  authorize("student"),
  checkFeatureAccess("projectServices"),
  asyncHandler(async (req, res) => {
    const { serviceType, university, program, topic, requirements, deadline, attachments } = req.body;

    if (!serviceType || !university || !program || !topic) {
      res.status(400);
      throw new Error("serviceType, university, program and topic are required");
    }

    const request = await ProjectRequest.create({
      student: req.user._id,
      serviceType,
      university,
      program,
      topic,
      requirements,
      deadline,
      attachments,
    });

    res.status(201).json({
      success: true,
      message: "Request submitted. Our team will review it and quote a price shortly.",
      request,
    });
  })
);

// @route   GET /api/project-requests/my
// @desc    Student views their own requests
router.get(
  "/my",
  protect,
  authorize("student"),
  asyncHandler(async (req, res) => {
    const requests = await ProjectRequest.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  })
);

// @route   GET /api/project-requests
// @desc    Admin / authorized teacher views all requests
router.get(
  "/",
  protect,
  authorize("admin", "teacher"),
  checkTeacherPermission("canManageProjectRequests"),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await ProjectRequest.find(filter)
      .populate("student", "name email university program")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  })
);

// @route   PUT /api/project-requests/:id/quote
// @desc    Admin / teacher sets a price for a request
router.put(
  "/:id/quote",
  protect,
  authorize("admin", "teacher"),
  checkTeacherPermission("canManageProjectRequests"),
  asyncHandler(async (req, res) => {
    const { quotedPrice } = req.body;
    const request = await ProjectRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    request.quotedPrice = quotedPrice;
    request.isPriceQuoted = true;
    request.status = "quoted";
    request.assignedTo = req.user._id;
    await request.save();

    res.json({ success: true, request });
  })
);

// @route   PUT /api/project-requests/:id/status
// @desc    Admin / teacher updates progress status & delivers final files
router.put(
  "/:id/status",
  protect,
  authorize("admin", "teacher"),
  checkTeacherPermission("canManageProjectRequests"),
  asyncHandler(async (req, res) => {
    const { status, deliverables } = req.body;
    const request = await ProjectRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (status) request.status = status;
    if (deliverables) request.deliverables = deliverables;

    await request.save();
    res.json({ success: true, request });
  })
);

module.exports = router;
