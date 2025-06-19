import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const fetchImportLogs = () => axios.get(`${API_BASE}/import-logs`);

