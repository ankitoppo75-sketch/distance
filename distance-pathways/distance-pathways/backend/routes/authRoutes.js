const express = require("express");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new student or teacher account
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, university, program, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }

    // Public registration is limited to student / teacher; admins are seeded/created by existing admins
    const safeRole = role === "teacher" ? "teacher" : "student";

    const user = await User.create({
      name,
      email,
      password,
      phone,
      university,
      program,
      role: safeRole,
    });

    res.status(201).json({
      success: true,
      user: user.toSafeJSON(),
      token: generateToken(user._id),
    });
  })
);

// @route   POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("Your account has been deactivated. Contact support.");
    }

    res.json({
      success: true,
      user: user.toSafeJSON(),
      token: generateToken(user._id),
    });
  })
);

// @route   GET /api/auth/me
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user.toSafeJSON() });
  })
);

// @route   PUT /api/auth/profile
router.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone, university, program } = req.body;

    req.user.name = name ?? req.user.name;
    req.user.phone = phone ?? req.user.phone;
    req.user.university = university ?? req.user.university;
    req.user.program = program ?? req.user.program;

    await req.user.save();
    res.json({ success: true, user: req.user.toSafeJSON() });
  })
);

module.exports = router;
