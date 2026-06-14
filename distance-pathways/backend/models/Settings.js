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

    // ---- Editable homepage content (Admin Panel -> Site Content tab) ----
    siteContent: {
      hero: {
        eyebrow: { type: String, default: "For IGNOU · DU SOL · Amity Online & more" },
        headlinePrefix: { type: String, default: "Your pathway through" },
        headlineHighlight: { type: String, default: "distance education" },
        headlineSuffix: { type: String, default: ", mapped out for you." },
        subtext: {
          type: String,
          default:
            "Watch recorded lectures, download notes & previous year papers, and get expert help with your synopsis, project, or research paper - pay only for what you need.",
        },
      },
      stats: {
        type: [
          {
            label: { type: String },
            value: { type: String },
          },
        ],
        default: [
          { label: "Video lectures", value: "1,200+" },
          { label: "Subjects covered", value: "180+" },
          { label: "Students helped", value: "25,000+" },
          { label: "Projects guided", value: "3,500+" },
        ],
      },
      testimonials: {
        type: [
          {
            name: { type: String },
            course: { type: String },
            text: { type: String },
          },
        ],
        default: [
          {
            name: "Priya Sharma",
            course: "IGNOU · BCA, 4th Semester",
            text: "The recorded lectures explained Data Structures better than my actual study centre. The PYQs were a lifesaver right before exams.",
          },
          {
            name: "Rohit Mehta",
            course: "DU SOL · B.Com Programme",
            text: "I was stuck on my project synopsis for weeks. Distance Pathways' team reviewed it, suggested changes, and I got it approved on the first try.",
          },
          {
            name: "Sneha Kapoor",
            course: "Amity Online · MBA",
            text: "Affordable, clear, and exactly aligned to my syllabus. I paid only for the two subjects I was weak in - no unnecessary bundles.",
          },
        ],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
