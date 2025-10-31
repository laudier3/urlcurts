import axios from 'axios';

const BASE_URL = 'https://www.urlcurt.site/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
