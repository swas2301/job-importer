const cron = require("node-cron");
const axios = require("axios");
const xml2js = require("xml2js");
const { Queue } = require("bullmq");
const { resultsMap } = require("../workers/jobWorker");
const ImportLog = require("../models/ImportLog");
const redis = require("../config/redis");


const jobQueue = new Queue("job-importer", { connection: redis });

const FEED_URLS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm"
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log("🔁 Job Import Cron Started");

    for (const feedUrl of FEED_URLS) {
      try {
        const response = await axios.get(feedUrl);
        const result = await xml2js.parseStringPromise(response.data, { mergeAttrs: true });
        const items = result?.rss?.channel?.[0]?.item || [];

        // Initialize result map
        resultsMap[feedUrl] = {
          newJobs: [],
          updatedJobs: [],
          failedJobs: [],
        };

        for (const item of items) {
          const jobData = {
            jobId: item.guid?.[0] || item.link?.[0],
            title: item.title?.[0],
            description: item.description?.[0],
            link: item.link?.[0],
            pubDate: item.pubDate?.[0],
            feedUrl,
          };

          await jobQueue.add("import-job", { job: jobData, feedUrl }, {
            attempts: 5,
            backoff: {
              type: "exponential",
              delay: 1000, // initial delay in ms
            },
          });
          
        }

        const expectedJobs = items.length;

let waitTime = 0;
while (
  resultsMap[feedUrl]?.newJobs.length + 
  resultsMap[feedUrl]?.updatedJobs.length + 
  resultsMap[feedUrl]?.failedJobs.length < expectedJobs &&
  waitTime < 10000 // wait max 10 seconds
) {
  await new Promise(res => setTimeout(res, 500));
  waitTime += 500;
}


        const feedResults = resultsMap[feedUrl] || {
          newJobs: [],
          updatedJobs: [],
          failedJobs: [],
        };

        await new ImportLog({
          fileName: feedUrl,
          importDateTime: new Date(),
          totalFetched: items.length,
          totalImported: feedResults.newJobs.length + feedResults.updatedJobs.length,
          newJobs: {
            count: feedResults.newJobs.length,
            jobs: feedResults.newJobs,
          },
          updatedJobs: {
            count: feedResults.updatedJobs.length,
            jobs: feedResults.updatedJobs,
          },
          failedJobs: {
            count: feedResults.failedJobs.length,
            jobs: feedResults.failedJobs,
          },
        }).save();

        console.log(`✅ Feed processed and logged: ${feedUrl}`);

        // Clean up for next run
        delete resultsMap[feedUrl];
      } catch (error) {
        console.error(`❌ Error processing feed ${feedUrl}:`, error.message);
      }
    }
  });
}

module.exports = { startScheduler };
