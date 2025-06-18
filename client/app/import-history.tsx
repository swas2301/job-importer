import { useEffect, useState } from 'react';
import { fetchImportLogs } from '../lib/api';

type FailedJob = {
  jobId: string;
  reason: string;
};

type ImportLog = {
  feedUrl: string;
  importDatetime: string;
  totalFetched: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: FailedJob[];
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString(); // or customize format
}

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);

  useEffect(() => {
    fetchImportLogs()
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to fetch import logs:', err));
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
                Imported on: {formatDate(log.importDatetime)}
              </p>
              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium">Total:</span> {log.totalFetched}
                </div>
                <div>
                  <span className="font-medium">New:</span> {log.newJobs}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {log.updatedJobs}
                </div>
                <div>
                  <span className="font-medium">Failed:</span> {log.failedJobs?.length || 0}
                </div>
              </div>

              {log.failedJobs && log.failedJobs.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-red-600 font-medium">
                    View Failed Jobs
                  </summary>
                  <ul className="mt-2 list-disc list-inside text-sm text-red-500">
                    {log.failedJobs.map((fail, i) => (
                      <li key={i}>
                        <strong>{fail.jobId}</strong>: {fail.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
