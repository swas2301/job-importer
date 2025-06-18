const mongoose = require('mongoose');

// Base structure for a job (same as your Job model)
const FullJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  title: String,
  description: String,
  link: String,
  pubDate: String,
  feedUrl: String,
  // Add more fields here if your Job schema has more
}, { _id: false });

// Failed job structure with an additional reason field
const FailedJobSchema = new mongoose.Schema({
  ...FullJobSchema.obj,
  reason: String,
}, { _id: false });

const ImportLogSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  importDateTime: {
    type: Date,
    default: Date.now,
  },
  totalFetched: {
    type: Number,
    required: true,
  },
  totalImported: {
    type: Number,
    required: true,
  },
  newJobs: {
    count: { type: Number, required: true },
    jobs: [FullJobSchema],
  },
  updatedJobs: {
    count: { type: Number, required: true },
    jobs: [FullJobSchema],
  },
  failedJobs: {
    count: { type: Number, required: true },
    jobs: [FailedJobSchema],
  },
});

module.exports = mongoose.model('ImportLog', ImportLogSchema);
