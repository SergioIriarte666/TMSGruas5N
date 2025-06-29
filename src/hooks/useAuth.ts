import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, hasRole, canAccess } from '@/lib/supabase';
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar y escuchar cambios de autenticación
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obtener el usuario actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
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

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Actualizar el último login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authUser.id);
        
        setUser(data as AuthUser);
      } else {
        // Si no existe el perfil, podríamos crearlo aquí
        setUser(null);
        setError('Perfil de usuario no encontrado');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser(null);
      setError('Error al obtener el perfil de usuario');
    }
  };

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        await fetchUserProfile(data.user);
        return user;
      }
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
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
    hasRole: (role: string) => hasRole(role),
    canAccess: (resource: string, action: string) => canAccess(resource, action)
  };
}