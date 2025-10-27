const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true, index: true }, // user-visible id
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  title: { type: String },
  description: { type: String },
  // metadata: tags, visibility, etc
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);