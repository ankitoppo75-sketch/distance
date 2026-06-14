const express = require("express");
const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");
const Page = require("../models/Page");

const router = express.Router();

// @route   GET /api/settings/public
// @desc    Public branding info (logo, colors, site name, feature flags, homepage content,
//          and the list of custom pages for nav/footer links) for the frontend shell
router.get(
  "/public",
  asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ singleton: "main" });
    if (!settings) settings = await Settings.create({ singleton: "main" });

    const pages = await Page.find(
      { isPublished: true, $or: [{ showInNav: true }, { showInFooter: true }] },
      "title slug showInNav showInFooter order"
    ).sort({ order: 1, title: 1 });

    res.json({
      success: true,
      settings: {
        siteName: settings.siteName,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        featureFlags: settings.featureFlags,
        supportedUniversities: settings.supportedUniversities,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        siteContent: settings.siteContent,
        pages,
      },
    });
  })
);

module.exports = router;
