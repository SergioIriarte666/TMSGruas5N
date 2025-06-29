import { create } from 'zustand';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.login(email, password);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
      set({ user: null, isLoading: false, error: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  initialize: () => {
    const user = AuthService.getCurrentUser();
    set({ user });
  }
}));