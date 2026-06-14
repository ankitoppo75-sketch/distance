const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const contentRoutes = require("./routes/contentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const publicRoutes = require("./routes/publicRoutes");

connectDB().then(() => {
  const seedDatabase = require("./utils/seed");
  seedDatabase().catch((err) => console.error("[seed] Error:", err.message));
});

const app = express();

// Allowed origins for browser requests:
// - CLIENT_URL (set this to your main frontend URL)
// - Any *.vercel.app URL (Vercel generates a new unique hash for every deployment,
//   so we can't rely on a single exact match staying valid)
// - localhost, for local development
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // non-browser requests (health checks, server-to-server)
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Serve uploaded files (logo, thumbnails, documents)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Distance Pathways API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/project-requests", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", publicRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
