import axios from 'axios';

//esperando a url via variavel de ambiente
const BASE_URL = process.env.NEXT_PUBLIC_YOUR_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,   // essencial para enviar cookies
  headers: { 'Content-Type': 'application/json' },
});
