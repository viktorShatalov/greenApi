import axios from 'axios';
import { GREEN_API_URL } from '../config/api';

export const GREEN_API_TIMEOUT = 10_000;

export const greenApiClient = axios.create({
  baseURL: GREEN_API_URL,
  timeout: GREEN_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
