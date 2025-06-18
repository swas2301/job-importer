
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true },
  title: String,
  company: String,
  description: String,
  location: String,
  updatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
