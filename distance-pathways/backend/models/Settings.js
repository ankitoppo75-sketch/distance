const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true }, // ensures only one settings doc

    siteName: { type: String, default: "Distance Pathways" },
    logoUrl: { type: String, default: "" },
    tagline: { type: String, default: "Your Pathway to Distance Education Success" },

    primaryColor: { type: String, default: "#2541B2" },
    accentColor: { type: String, default: "#00C2A8" },

    // Global toggles - admin can switch entire features on/off for everyone
    featureFlags: {
      videoLibrary: { type: Boolean, default: true },
      notesLibrary: { type: Boolean, default: true },
      questionPapers: { type: Boolean, default: true },
      projectServices: { type: Boolean, default: true },
      liveClasses: { type: Boolean, default: true },
      courseEnrollment: { type: Boolean, default: true },
    },

    supportedUniversities: {
      type: [String],
      default: ["IGNOU", "DU SOL", "Amity Online", "NMIMS GE", "Other"],
    },

    contactEmail: { type: String, default: "support@distancepathways.com" },
    contactPhone: { type: String, default: "+91 90000 00000" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
