import axios from "axios"
import { getAccessTokenFromCookie } from "@/lib/cookies"
import type { AuthResponse } from "@/types/auth"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "")

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessTokenFromCookie()

  if (!token) {
    return config
  }

  config.headers = {
    ...(config.headers ?? {}),
    Authorization: `Bearer ${token}`
  }

  return config
})

export type { AuthResponse }
