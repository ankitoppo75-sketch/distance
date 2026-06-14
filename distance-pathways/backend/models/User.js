const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    university: { type: String, trim: true }, // e.g. IGNOU, DU SOL, Amity Online
    program: { type: String, trim: true }, // e.g. BCA, MBA, B.Com

    avatar: { type: String, default: "" },

    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    // Records every paid item a student has unlocked (course / video / notes / paper / project)
    purchasedContent: [
      {
        itemType: {
          type: String,
          enum: ["course", "content", "projectRequest"],
        },
        item: { type: mongoose.Schema.Types.ObjectId },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        purchasedAt: { type: Date, default: Date.now },
      },
    ],

    // ---- Admin controlled feature access (per teacher / per student) ----
    // For teachers: which platform capabilities they're allowed to use
    teacherPermissions: {
      canUploadVideos: { type: Boolean, default: true },
      canUploadNotes: { type: Boolean, default: true },
      canUploadQuestionPapers: { type: Boolean, default: true },
      canManageProjectRequests: { type: Boolean, default: false },
      canManageCourses: { type: Boolean, default: false },
    },

    // For students: features that have been explicitly disabled for this account
    restrictedFeatures: [
      {
        type: String,
        enum: [
          "liveClasses",
          "videoLibrary",
          "notesLibrary",
          "questionPapers",
          "projectServices",
          "courseEnrollment",
        ],
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
