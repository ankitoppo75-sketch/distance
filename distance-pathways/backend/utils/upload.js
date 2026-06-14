const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/misc";
    if (file.fieldname === "logo") folder = "uploads/logo";
    if (file.fieldname === "thumbnail") folder = "uploads/thumbnails";
    if (file.fieldname === "document") folder = "uploads/documents";
    if (file.fieldname === "avatar") folder = "uploads/avatars";

    const fullPath = path.join(__dirname, "..", folder);
    ensureDir(fullPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|svg|pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext.replace(".", ""))) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

module.exports = upload;
