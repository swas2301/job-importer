// queue/jobQueue.js
const { Queue } = require("bullmq");
const redis = require("../config/redis"); // Make sure you have this file that exports Redis connection

const jobQueue = new Queue("job-importer", {
  connection: redis,
});

module.exports = jobQueue;
