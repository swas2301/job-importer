import axios from 'axios';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;


//export const fetchJobs = () => axios.get(`${API_BASE}`);
export const fetchImportLogs = () => axios.get(`${API_BASE}/import-logs`);
