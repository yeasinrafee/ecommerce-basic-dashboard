import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthenticatedUser } from "@/types/auth"

type AuthState = {
  user: AuthenticatedUser | null
  setUser: (user: AuthenticatedUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? undefined : window.localStorage
      ),
      partialize: (state) => ({ user: state.user })
    }
  )
)
