'use client';

import { useEffect, useState } from 'react';
import { fetchImportLogs } from '../lib/api';

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
    const fetchAndSortLogs = async () => {
      try {
        const res = await fetchImportLogs();

        // Sort logs by most recent date
        const sortedLogs = res.data.sort(
          (a: ImportLog, b: ImportLog) =>
            new Date(b.importDateTime).getTime() -
            new Date(a.importDateTime).getTime()
        );

        setLogs(sortedLogs);
      } catch (err) {
        console.error('Failed to fetch import logs:', err);
      }
    };

    fetchAndSortLogs(); // initial fetch

    const interval = setInterval(fetchAndSortLogs, 5000); // auto-fetch every 5 seconds

    return () => clearInterval(interval); // clean up
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
