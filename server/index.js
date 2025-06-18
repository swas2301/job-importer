require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startScheduler } = require('./cron/scheduler');
const importLogRoutes = require('./routes/importlog');
const jobQueue = require("./queues/jobQueue"); // ✅ Import the queue here
const { initSocket } = require("./socket");
const http = require("http");

const app = express();
const server = http.createServer(app);

// Initialize socket server
initSocket(server);

app.use(cors());
app.use(express.json());
app.use('/import-logs', importLogRoutes);

connectDB();

// ✅ Immediately clear all jobs when the server starts
(async () => {
  try {
    console.log("🧹 Cleaning all BullMQ job data...");

    await jobQueue.drain();
    await jobQueue.clean(0, 1000, "completed");
    await jobQueue.clean(0, 1000, "failed");
    await jobQueue.clean(0, 1000, "delayed");
    await jobQueue.obliterate({ force: true });

    console.log("✅ Queue cleaned successfully.");
  } catch (err) {
    console.error("❌ Failed to clean queue:", err.message);
  }

  startScheduler();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
