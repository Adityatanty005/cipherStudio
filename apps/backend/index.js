require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const Project = require("./models/Project"); // create next

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan("dev"));
// body size limit: 512kb for safety (project metadata and typical files)
app.use(express.json({ limit: "512kb" }));

// basic IP rate limiter for /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// CORS: restrict to frontend origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// warn if using dev JWT secret
if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET not set in env — using dev secret. Rotate before production."
  );
}

// mount auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// auth middleware
const authMiddleware = require("./middleware/auth");

// create project metadata (no files here) - protected
app.post("/api/projects", authMiddleware, async (req, res) => {
  try {
    const { projectId, title, description } = req.body;
    if (!projectId)
      return res.status(400).json({ error: "projectId required" });
    const doc = await Project.findOneAndUpdate(
      { projectId },
      { title, description },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

// get project - protected
app.get("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const doc = await Project.findOne({ projectId: req.params.id });
    if (!doc) return res.status(404).json({ error: "not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

// optional delete - protected
app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const doc = await Project.findOneAndDelete({ projectId: req.params.id });
    if (!doc) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

// return project metadata + file tree - protected
app.get("/api/projects/:id/tree", authMiddleware, async (req, res) => {
  try {
    const proj = await Project.findOne({ projectId: req.params.id });
    if (!proj) return res.status(404).json({ error: "not found" });
    const File = require("./models/File");
    const files = await File.find({ projectId: req.params.id })
      .lean()
      .sort({ createdAt: 1 });
    const map = {};
    files.forEach((f) => {
      map[f._id] = { ...f, children: [] };
    });
    const roots = [];
    files.forEach((f) => {
      if (f.parentId) {
        const parent = map[f.parentId];
        if (parent) parent.children.push(map[f._id]);
      } else {
        roots.push(map[f._id]);
      }
    });
    res.json({ project: proj, tree: roots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

// mount files routes (protected inside routes if needed) - wrap with auth
const fileRoutes = require("./routes/files");
app.use("/api", authMiddleware, fileRoutes);

// connect to mongo and start
mongoose
  .connect(process.env.MONGO_URI, { dbName: "cipherstudio" })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });
