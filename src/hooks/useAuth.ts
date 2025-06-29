import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { User } from '@/types';
import { toast } from 'sonner';

export interface AuthUser extends User {}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar al cargar el componente
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      toast.error(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      toast.success('Sesión cerrada correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
      toast.error(err.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => AuthService.hasRole(role as User['role']),
    canAccess: (resource: string, action: string) => AuthService.canAccess(resource, action)
  };
}