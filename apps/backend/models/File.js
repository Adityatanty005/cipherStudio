const mongoose = require("mongoose");

const MAX_CONTENT_BYTES = 200 * 1024; // 200 KB per file

const FileSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, index: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    }, // null = root
    name: { type: String, required: true },
    type: { type: String, enum: ["file", "folder"], required: true },
    content: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return Buffer.byteLength(v || "", "utf8") <= MAX_CONTENT_BYTES;
        },
        message: `Content exceeds max size of ${MAX_CONTENT_BYTES} bytes`,
      },
    },
    mimeType: { type: String, default: null },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// unique name per parent within a project
FileSchema.index({ projectId: 1, parentId: 1, name: 1 }, { unique: true });
FileSchema.index({ projectId: 1, parentId: 1 });

// prevent deleting non-empty folders (simple guard)
FileSchema.pre("remove", async function (next) {
  if (this.type === "folder") {
    const children = await mongoose
      .model("File")
      .find({ parentId: this._id })
      .limit(1);
    if (children.length) return next(new Error("Folder not empty"));
  }
  next();
});

module.exports = mongoose.model("File", FileSchema);
