import { create } from 'zustand';
import { UserProfile, UserRole } from '@evnuvora/shared';

interface AuthState {
  user: UserProfile | null;
  activeRole: UserRole;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  setActiveRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeRole: 'driver',
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  setAuth: (user, accessToken, refreshToken) =>
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      activeRole: user.role === 'host' ? 'host' : 'driver',
    }),
  setActiveRole: (activeRole) => set({ activeRole }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeRole: 'driver',
    }),
}));
