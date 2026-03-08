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

  const token = getAccessTokenFromCookie()

  if (!token) {
    return config
  }

  // Ensure FormData requests are sent with the browser-managed Content-Type
  // (so boundary is added). Remove any preset Content-Type when body is FormData.
  const headersObj: Record<string, any> = { ...(config.headers || {}) };

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    // let the browser set Content-Type with boundary
    if (headersObj['Content-Type']) delete headersObj['Content-Type'];
  } else {
    headersObj['Content-Type'] = 'application/json';
  }

  headersObj['Authorization'] = `Bearer ${token}`;
  config.headers = headersObj;

  return config
})
