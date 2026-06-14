/**
 * Idempotent database seeder.
 *
 * - Exported as `seedDatabase()` so server.js can call it automatically on every
 *   startup (safe to run repeatedly - it only creates things that don't exist yet).
 * - Can also be run directly with `npm run seed` if a terminal is available.
 */
const User = require("../models/User");
const Settings = require("../models/Settings");
const Course = require("../models/Course");
const Content = require("../models/Content");
const Page = require("../models/Page");

const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const seedDatabase = async () => {
  // ---- Admin account ----
  const adminEmail = "admin@distancepathways.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Distance Pathways Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "admin",
    });
    console.log(`[seed] Admin created -> email: ${adminEmail} | password: Admin@123`);
  }

  // ---- Settings ----
  let settings = await Settings.findOne({ singleton: "main" });
  if (!settings) {
    settings = await Settings.create({ singleton: "main" });
    console.log("[seed] Default settings created.");
  }

  // ---- Sample teacher ----
  let teacher = await User.findOne({ email: "teacher@distancepathways.com" });
  if (!teacher) {
    teacher = await User.create({
      name: "Dr. Asha Verma",
      email: "teacher@distancepathways.com",
      password: "Teacher@123",
      role: "teacher",
      teacherPermissions: {
        canUploadVideos: true,
        canUploadNotes: true,
        canUploadQuestionPapers: true,
        canManageProjectRequests: true,
        canManageCourses: true,
      },
    });
    console.log("[seed] Sample teacher created -> teacher@distancepathways.com / Teacher@123");
  }

  // ---- Sample course ----
  let course = await Course.findOne({ title: "Business Communication" });
  if (!course) {
    course = await Course.create({
      title: "Business Communication",
      description:
        "Complete coverage of Business Communication for distance learning programs - covers IGNOU BCOM/BBA syllabus with practical writing exercises, presentations, and exam-oriented notes.",
      university: "IGNOU",
      program: "BBA",
      subject: "Business Communication",
      semester: "Semester 1",
      thumbnail: "",
      price: 499,
      isFree: false,
      instructor: teacher._id,
      tags: ["communication", "IGNOU", "BBA"],
    });

    await Content.create([
      {
        title: "Unit 1: Introduction to Business Communication (Free Preview)",
        description: "Free introductory lecture covering the basics.",
        type: "video",
        course: course._id,
        fileUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        durationMinutes: 32,
        price: 0,
        isFree: true,
        uploadedBy: teacher._id,
      },
      {
        title: "Unit 2-8: Full Recorded Lecture Series",
        description: "Complete recorded lecture series for all units.",
        type: "video",
        course: course._id,
        fileUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        durationMinutes: 240,
        price: 299,
        isFree: false,
        uploadedBy: teacher._id,
      },
      {
        title: "Handwritten Notes - All Units (PDF)",
        description: "Concise handwritten notes covering the entire syllabus.",
        type: "notes",
        course: course._id,
        fileUrl: SAMPLE_PDF_URL,
        price: 99,
        isFree: false,
        uploadedBy: teacher._id,
      },
      {
        title: "Previous Year Question Papers (2021-2024)",
        description: "Solved question papers from the last 4 years.",
        type: "questionPaper",
        course: course._id,
        fileUrl: SAMPLE_PDF_URL,
        price: 49,
        isFree: false,
        year: "2021-2024",
        uploadedBy: teacher._id,
      },
    ]);

    console.log("[seed] Sample course and content created.");
  }

  // ---- Sample pages (Admin Panel -> Pages tab) ----
  const aboutExists = await Page.findOne({ slug: "about-us" });
  if (!aboutExists) {
    await Page.create({
      title: "About Us",
      slug: "about-us",
      content:
        "## About Distance Pathways\n\nDistance Pathways helps students enrolled in distance and online university programmes - including IGNOU, DU SOL and Amity Online - learn faster and submit with confidence.\n\nWe provide subject-wise recorded lectures, exam-focused notes, previous year question papers, and one-on-one help with synopsis, project and research paper writing.\n\n### Our mission\n\nMake quality distance education support affordable and accessible, with pay-as-you-go pricing so students only pay for what they actually need.\n\n*This page can be edited any time from the Admin Panel -> Pages tab.*",
      showInNav: true,
      showInFooter: true,
      order: 1,
      isPublished: true,
    });
    console.log("[seed] Sample 'About Us' page created.");
  }

  const privacyExists = await Page.findOne({ slug: "privacy-policy" });
  if (!privacyExists) {
    await Page.create({
      title: "Privacy Policy",
      slug: "privacy-policy",
      content:
        "## Privacy Policy\n\nThis is a placeholder privacy policy. Replace this content with your actual policy from the Admin Panel -> Pages tab.\n\n### Information we collect\n\nWe collect the information you provide when creating an account, such as your name, email address, university and programme.\n\n### How we use it\n\nWe use this information to provide access to courses, track your purchases, and improve our services.\n\n### Contact us\n\nIf you have questions about this policy, contact us using the details in the footer.",
      showInNav: false,
      showInFooter: true,
      order: 2,
      isPublished: true,
    });
    console.log("[seed] Sample 'Privacy Policy' page created.");
  }
};

module.exports = seedDatabase;

// Allow running directly via `npm run seed` when a terminal IS available.
if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config();
  const connectDB = require("../config/db");

  connectDB()
    .then(seedDatabase)
    .then(() => {
      console.log("[seed] Seeding complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
