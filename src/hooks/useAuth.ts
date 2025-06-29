import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { AuthService } from '@/lib/auth';

export function useAuth() {
  const { user, isLoading, error, login, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => AuthService.hasRole(role as any),
    canAccess: (resource: string, action: string) => AuthService.canAccess(resource, action)
  };
}