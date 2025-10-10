import { getAccessToken } from "../appData/authStore";
import _axios, { type AxiosRequestHeaders } from "axios";

const axios = _axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

axios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = axios;
