const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const File = require("../models/File");

// create a file or folder
router.post("/:projectId/files", async (req, res) => {
  const { projectId } = req.params;
  const { parentId = null, name, type, content = "" } = req.body;
  if (!name || !type)
    return res.status(400).json({ error: "name and type required" });

  // ensure project exists
  const project = await Project.findOne({ projectId });
  if (!project) return res.status(404).json({ error: "project not found" });

  try {
    const file = await File.create({
      projectId,
      parentId,
      name,
      type,
      content,
      size: Buffer.byteLength(content || "", "utf8"),
    });
    return res.json(file);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ error: "name already exists in this folder" });
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
});

// update (rename/move/save content)
router.put("/:projectId/files/:fileId", async (req, res) => {
  const { projectId, fileId } = req.params;
  const { name, parentId, content } = req.body;
  try {
    const file = await File.findOne({ _id: fileId, projectId });
    if (!file) return res.status(404).json({ error: "not found" });

    if (name && name !== file.name) {
      // check collision
      const collision = await File.findOne({
        projectId,
        parentId: parentId ?? file.parentId,
        name,
        _id: { $ne: fileId },
      });
      if (collision)
        return res.status(409).json({ error: "name already exists" });
      file.name = name;
    }
    if (typeof parentId !== "undefined") file.parentId = parentId;
    if (typeof content !== "undefined") {
      file.content = content;
      file.size = Buffer.byteLength(content || "", "utf8");
    }
    await file.save();
    return res.json(file);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
});

// delete file/folder
router.delete("/:projectId/files/:fileId", async (req, res) => {
  const { projectId, fileId } = req.params;
  try {
    const file = await File.findOne({ _id: fileId, projectId });
    if (!file) return res.status(404).json({ error: "not found" });
    // folder guard handled by pre 'remove'
    await file.remove();
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "internal" });
  }
});

// list files (flat) or return tree
router.get("/:projectId/files", async (req, res) => {
  const { projectId } = req.params;
  try {
    const files = await File.find({ projectId }).lean().sort({ createdAt: 1 });
    return res.json(files);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
});

module.exports = router;
