import axios from 'axios';

const API_BASE = 'https://job-importer.onrender.com';

export const fetchImportLogs = () => axios.get(`${API_BASE}/import-logs`);

