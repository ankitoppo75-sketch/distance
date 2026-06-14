const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Verifies the JWT and attaches the user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("Not authorized, user not found or inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Attaches req.user if a valid token is present, but never blocks the request (used for public pages
// that need to show locked/unlocked state for logged-in users while still working for guests).
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});

// Restricts a route to one or more roles, e.g. authorize("admin"), authorize("admin", "teacher")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Access denied for role: ${req.user ? req.user.role : "guest"}`);
  }
  next();
};

// Checks that a student account has not had a feature restricted by admin,
// and that the feature is not globally disabled.
const checkFeatureAccess = (featureKey) =>
  asyncHandler(async (req, res, next) => {
    const Settings = require("../models/Settings");
    const settings = await Settings.findOne({ singleton: "main" });

    if (settings && settings.featureFlags && settings.featureFlags[featureKey] === false) {
      res.status(403);
      throw new Error("This feature is currently unavailable. Please check back later.");
    }

    if (req.user && req.user.role === "student" && req.user.restrictedFeatures?.includes(featureKey)) {
      res.status(403);
      throw new Error("Your account does not have access to this feature. Contact support for help.");
    }

    next();
  });

// Checks a teacher-specific permission flag set by the admin
const checkTeacherPermission = (permissionKey) => (req, res, next) => {
  if (req.user.role === "admin") return next(); // admins always allowed

  if (req.user.role !== "teacher" || !req.user.teacherPermissions?.[permissionKey]) {
    res.status(403);
    throw new Error("You do not have permission to perform this action. Contact the admin.");
  }
  next();
};

module.exports = { protect, optionalAuth, authorize, checkFeatureAccess, checkTeacherPermission };
