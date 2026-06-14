const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    type: {
      type: String,
      enum: ["video", "notes", "questionPaper"],
      required: true,
    },

    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    // For videos: YouTube embed URL or hosted video URL
    // For notes / question papers: downloadable file URL (PDF etc.)
    fileUrl: { type: String, required: true },
    previewUrl: { type: String, default: "" }, // optional free preview / sample
    thumbnail: { type: String, default: "" },

    durationMinutes: { type: Number, default: 0 }, // for videos

    price: { type: Number, required: true, default: 0 },
    isFree: { type: Boolean, default: false },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    year: { type: String, trim: true }, // e.g. "2023" for question papers

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

contentSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Content", contentSchema);
