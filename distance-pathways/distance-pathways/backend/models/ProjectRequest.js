const mongoose = require("mongoose");

const projectRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    serviceType: {
      type: String,
      enum: ["synopsis", "project", "researchPaper", "dissertation"],
      required: true,
    },

    university: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    requirements: { type: String, default: "" },
    deadline: { type: Date },

    // Reference attachments uploaded by the student (syllabus, guidelines etc.)
    attachments: [{ type: String }],

    quotedPrice: { type: Number, default: 0 }, // set by admin/teacher after reviewing the request
    isPriceQuoted: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "quoted", "paid", "inProgress", "delivered", "cancelled"],
      default: "pending",
    },

    deliverables: [{ type: String }], // final files delivered to the student

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // teacher handling it

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectRequest", projectRequestSchema);
