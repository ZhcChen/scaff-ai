import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse } from "@/types";

interface AuthState {
  token: string | null;
  user: LoginResponse["user"] | null;
  roles: string[];
  permissions: string[];
  isLoggedIn: boolean;
  setAuth: (data: LoginResponse) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      roles: [],
      permissions: [],
      isLoggedIn: false,

      setAuth: (data) => {
        set({
          token: data.token,
          user: data.user,
          roles: data.roles,
          permissions: data.permissions,
          isLoggedIn: true,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          roles: [],
          permissions: [],
          isLoggedIn: false,
        });
      },

      hasPermission: (permission) => {
        const state = get();
        // 超级管理员
        if (state.user?.id === 1) return true;
        return state.permissions.includes(permission);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
