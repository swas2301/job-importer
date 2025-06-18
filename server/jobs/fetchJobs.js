
const axios = require("axios");
const parseXML = require("../utils/xmlToJson");

const fetchJobsFromFeed = async (feedUrl) => {
  try {
    const { data: xml } = await axios.get(feedUrl);
    const json = await parseXML(xml);
    const items = json.rss?.channel?.item || [];
    
    const jobs = items.map((item) => ({
      jobId: item.guid || item.link,
      title: item.title,
      company: item["job:company"] || "Unknown",
      description: item.description,
      location: item["job:location"] || "Remote",
      updatedAt: new Date(item.pubDate || Date.now()),
    }));

    return { jobs, feedUrl };
  } catch (error) {
    console.error(`Error fetching jobs from ${feedUrl}:`, error.message);
    return { jobs: [], feedUrl, error: error.message };
  }
};

module.exports = fetchJobsFromFeed;
