const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    university: {
      type: String,
      required: true,
      trim: true,
      // e.g. "IGNOU", "DU SOL", "Amity Online", "NMIMS", "Other"
    },
    program: { type: String, required: true, trim: true }, // e.g. BCA, BBA, MA English
    subject: { type: String, required: true, trim: true },
    semester: { type: String, trim: true }, // e.g. "Semester 3"

    thumbnail: { type: String, default: "" },

    price: { type: Number, required: true, default: 0 },
    isFree: { type: Boolean, default: false },

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    tags: [{ type: String, trim: true }],

    isPublished: { type: Boolean, default: true },

    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    studentsEnrolled: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", subject: "text", program: "text", university: "text" });

module.exports = mongoose.model("Course", courseSchema);
