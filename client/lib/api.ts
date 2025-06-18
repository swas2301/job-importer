import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://job-importer.onrender.com';

export const fetchImportLogs = () => axios.get(`${API_BASE}/import-logs`);

