const { Worker } = require("bullmq");
const redis = require("../config/redis");
const Job = require("../models/job");
const { getIO } = require("../socket"); // ✅ Use shared socket instance

require("dotenv").config();

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

    const io = getIO(); // ✅ Use shared Socket.IO instance

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
    settings: {
      backoffStrategies: {
        exponential: (attemptsMade) => Math.pow(2, attemptsMade) * 1000,
      },
    },
  }
);

module.exports = { worker, resultsMap, BATCH_SIZE };
