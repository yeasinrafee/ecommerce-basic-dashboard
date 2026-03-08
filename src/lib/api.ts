import axios, { AxiosHeaders } from "axios"
import { getAccessTokenFromCookie } from "@/lib/cookies"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/proxy").replace(/\/$/, "");

const normalizeUrlForBase = (url: string, baseURL?: string) => {
  if (!baseURL || !url.startsWith("/")) {
    return url
  }

  const normalizedBase = baseURL.toLowerCase()

  if (normalizedBase.endsWith("/api") && url.startsWith("/api/proxy/")) {
    return url.replace(/^\/api\/proxy/, "")
  }

  if (normalizedBase.endsWith("/api/proxy") && url.startsWith("/api/proxy/")) {
    return url.replace(/^\/api\/proxy/, "")
  }

  return url
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  if (typeof config.url === "string") {
    config.url = normalizeUrlForBase(config.url, config.baseURL)
  }

  const headersObj = AxiosHeaders.from(config.headers || {});
  const token = getAccessTokenFromCookie()

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    headersObj.delete('Content-Type');
  } else {
    headersObj.set('Content-Type', 'application/json');
  }

  if (token) {
    headersObj.set('Authorization', `Bearer ${token}`);
  } else {
    headersObj.delete('Authorization');
  }

  config.headers = headersObj;

  return config
})
