// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_YOUR_URL || "https://url.urlcurt.site/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


/*import axios from 'axios';

//esperando a url via variavel de ambiente
const BASE_URL = process.env.NEXT_PUBLIC_YOUR_URL!;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,   // essencial para enviar cookies
  headers: { 'Content-Type': 'application/json' },
});
*/