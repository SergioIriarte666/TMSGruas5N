import { useState, useEffect } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer' | 'client';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar al montar el componente
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obtener el usuario actual del localStorage
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Error al inicializar la autenticación');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Inicializar
    initialize();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      return user;
    } catch (err: any) {
      console.error('Error logging in:', err);
      setError(err.message || 'Error al iniciar sesión');
      toast.error(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.logout();
      setUser(null);
    } catch (err: any) {
      console.error('Error logging out:', err);
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
    hasRole: (role: string) => AuthService.hasRole(role),
    canAccess: (resource: string, action: string) => AuthService.canAccess(resource, action)
  };
}