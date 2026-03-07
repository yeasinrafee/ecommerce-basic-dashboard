import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { StoredUser } from "@/types/auth"

type AuthState = {
  user: StoredUser | null
  setUser: (user: StoredUser) => void
  clearUser: () => void
}

const localStorageWrapper =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage(() => window.localStorage)

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    {
      name: "auth-storage",
      ...(localStorageWrapper ? { storage: localStorageWrapper } : {}),
      partialize: (state) => ({ user: state.user })
    }
  )
)
