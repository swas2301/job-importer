'use client';

import { useEffect, useState } from 'react';
import { fetchImportLogs } from '../lib/api';
import { io, Socket } from 'socket.io-client';

type FullJob = {
  jobId: string;
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
  feedUrl?: string;
};

type FailedJob = FullJob & {
  reason: string;
};

type ImportLog = {
  feedUrl: string;
  importDateTime: string;
  totalFetched: number;
  totalImported: number;
  newJobs: {
    count: number;
    jobs: FullJob[];
  };
  updatedJobs: {
    count: number;
    jobs: FullJob[];
  };
  failedJobs: {
    count: number;
    jobs: FailedJob[];
  };
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchImportLogs()
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to fetch import logs:', err));

    // Setup Socket.IO
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

    socket.on('jobStatus', (data) => {
      console.log('📡 Real-time update:', data);

      // Append new real-time update to logs
      setLogs(prev => {
        const updatedLogs = [...prev];
        const index = updatedLogs.findIndex(log => log.feedUrl === data.feedUrl);

        if (index !== -1) {
          const log = updatedLogs[index];
          if (data.type === 'new') {
            log.newJobs.count += 1;
            log.newJobs.jobs.push(data.job);
          } else if (data.type === 'updated') {
            log.updatedJobs.count += 1;
            log.updatedJobs.jobs.push(data.job);
          } else if (data.type === 'failed') {
            log.failedJobs.count += 1;
            log.failedJobs.jobs.push(data.job);
          }
          log.totalImported = log.newJobs.count + log.updatedJobs.count;
        } else {
          // If not found, create new log entry
          updatedLogs.unshift({
            feedUrl: data.feedUrl,
            importDateTime: new Date().toISOString(),
            totalFetched: 1,
            totalImported: data.type !== 'failed' ? 1 : 0,
            newJobs: {
              count: data.type === 'new' ? 1 : 0,
              jobs: data.type === 'new' ? [data.job] : [],
            },
            updatedJobs: {
              count: data.type === 'updated' ? 1 : 0,
              jobs: data.type === 'updated' ? [data.job] : [],
            },
            failedJobs: {
              count: data.type === 'failed' ? 1 : 0,
              jobs: data.type === 'failed' ? [data.job] : [],
            },
          });
        }

        return [...updatedLogs];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🧾 Import History</h1>

      {logs.length === 0 ? (
        <p className="text-center text-gray-500">No import logs found.</p>
      ) : (
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="text-lg font-semibold text-blue-600 break-all">
                {log.feedUrl}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Imported on: {formatDate(log.importDateTime)}
              </p>
              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium">Total:</span> {log.totalFetched}
                </div>
                <div>
                  <span className="font-medium">New:</span> {log.newJobs.count}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {log.updatedJobs.count}
                </div>
                <div>
                  <span className="font-medium">Failed:</span> {log.failedJobs.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
