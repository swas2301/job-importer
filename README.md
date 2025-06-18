# 🛠️ Job Importer System

A scalable job importer system that fetches job listings from multiple RSS/XML feeds, processes and stores them in MongoDB, tracks import logs with success/failure details, and provides real-time frontend updates using Socket.IO.

---

## 🚀 Features

- ✅ Background job processing with BullMQ and Redis
- 🔁 Retry logic with exponential backoff
- 🧪 Schema-based job validation and normalization
- 📝 Import logs saved to MongoDB
- 📡 Real-time updates with Socket.IO
- 🧠 Clean frontend dashboard built with Next.js
- 📦 Environment-configurable batch size and concurrency
- ☁️ Ready for deployment on Render (backend) and Vercel (frontend)

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- **Framework:** Next.js (React)
- **Realtime:** Socket.IO client
- **Styling:** Tailwind CSS

### 🧠 Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Queue System:** BullMQ (built on Redis)
- **Realtime Server:** Socket.IO
- **Worker Processing:** BullMQ Worker for job processing


---
## 🚀 Getting Started

### 📦 Clone the repository

```bash
git clone https://github.com/swas2301/job-importer.git
cd job-importer
```
### Run Backend

```bash
cd server
node index.js
```
### Run Frontend

```bash
cd client
npm run dev
```
## 🌍 `.env` Configuration

Create a `.env` file in your project root with the following:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobdb

# Redis
REDIS_URL=redis://username:password@redis-host


# Queue & Worker
BATCH_SIZE=30
MAX_CONCURRENCY=5

# Port
PORT=5000

