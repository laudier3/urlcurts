import axios from 'axios';

//esperando a url via variavel de ambiente
const BASE_URL = process.env.NEXT_PUBLIC_YOUR_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
