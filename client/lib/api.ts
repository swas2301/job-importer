import axios from 'axios';

const API_BASE = 'http://localhost:5000/import-logs';

//export const fetchJobs = () => axios.get(`${API_BASE}`);
export const fetchImportLogs = () => axios.get(`${API_BASE}`);
