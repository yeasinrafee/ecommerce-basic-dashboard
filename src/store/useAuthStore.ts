import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthTokens, AuthenticatedUser } from "@/types/auth"

type AuthState = {
  user: AuthenticatedUser | null
  tokens: AuthTokens | null
  setAuth: (user: AuthenticatedUser, tokens: AuthTokens) => void
  setTokens: (tokens: AuthTokens) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => set({ user, tokens }),
      setTokens: (tokens) => set({ tokens }),
      clearAuth: () => set({ user: null, tokens: null })
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? undefined : window.localStorage
      ),
      partialize: (state) => ({ user: state.user, tokens: state.tokens })
    }
  )
)
