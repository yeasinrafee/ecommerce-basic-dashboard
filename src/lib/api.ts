import axios, { AxiosHeaders } from "axios"
import { getAccessTokenFromCookie } from "@/lib/cookies"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessTokenFromCookie()

  if (!token) {
    return config
  }

  const headers = AxiosHeaders.from(config.headers)
  headers.set("Authorization", `Bearer ${token}`)
  config.headers = headers

  return config
})
