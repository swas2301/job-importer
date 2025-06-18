const { Worker } = require("bullmq");
const redis = require("../config/redis");
const Job = require("../models/job");
const ImportLog = require("../models/ImportLog");
const { Server } = require("socket.io");
const http = require("http");

require("dotenv").config();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Or set to your frontend domain
  },
});
server.listen(4001, () =>
  console.log("🧠 Socket.IO worker server running on port 4001")
);

// Environment-configurable settings
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE);

const resultsMap = {}; // Track all jobs per feed

function normalizeXmlField(field) {
  if (typeof field === "object" && field._) return field._;
  return field;
}

const worker = new Worker(
  "job-importer",
  async (job) => {
    const { job: jobData, feedUrl } = job.data;

    Object.keys(jobData).forEach((key) => {
      jobData[key] = normalizeXmlField(jobData[key]);
    });

    if (!resultsMap[feedUrl]) {
      resultsMap[feedUrl] = {
        newJobs: [],
        updatedJobs: [],
        failedJobs: [],
      };
    }

    try {
      const existing = await Job.findOne({ jobId: jobData.jobId });

      if (existing) {
        await Job.updateOne({ jobId: jobData.jobId }, jobData);
        resultsMap[feedUrl].updatedJobs.push(jobData);

        io.emit("jobStatus", {
          feedUrl,
          type: "updated",
          job: jobData,
        });
      } else {
        await new Job(jobData).save();
        resultsMap[feedUrl].newJobs.push(jobData);

        io.emit("jobStatus", {
          feedUrl,
          type: "new",
          job: jobData,
        });
      }
    } catch (err) {
      resultsMap[feedUrl].failedJobs.push({ ...jobData, reason: err.message });

      io.emit("jobStatus", {
        feedUrl,
        type: "failed",
        job: { ...jobData, reason: err.message },
      });
    }
  },
  {
    concurrency: MAX_CONCURRENCY,
    connection: {
      ...redis.options,
      maxRetriesPerRequest: null,
    },
    // Global retry logic (can also be applied per job when added to queue)
    settings: {
      backoffStrategies: {
        exponential: (attemptsMade) => Math.pow(2, attemptsMade) * 1000,
      },
    },
  }
);

module.exports = { worker, resultsMap, BATCH_SIZE };
