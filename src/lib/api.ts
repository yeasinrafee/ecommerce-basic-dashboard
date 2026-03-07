import axios from "axios"
import baseUrl from "@/routes/index"
import type { AuthResponse } from "@/types/auth"

export const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
})

export type { AuthResponse }
