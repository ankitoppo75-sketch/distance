const mongoose = require("mongoose");

// Custom content pages (About Us, Privacy Policy, FAQs, etc.) created by the admin
// through the Admin Panel's "Pages" tab - no code changes needed to add new pages.
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"],
    },
    content: { type: String, default: "" }, // Markdown - rendered on the frontend
    showInNav: { type: Boolean, default: false },
    showInFooter: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", pageSchema);
