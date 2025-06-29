// Este archivo es un stub para mantener la compatibilidad con el código existente
// pero sin depender de Supabase

import { User } from '@/types';
import { AuthService } from '@/lib/auth';

export const supabase = {
  auth: {
    getUser: async () => {
      return { data: { user: null }, error: null };
    },
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async () => {
      return { data: { user: null }, error: null };
    },
    signOut: async () => {
      return { error: null };
    }
  },
  from: () => {
    return {
      select: () => {
        return {
          eq: () => {
            return {
              single: () => {
                return { data: null, error: null };
              }
            };
          }
        };
      },
      update: () => {
        return {
          eq: () => {
            return { error: null };
          }
        };
      }
    };
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  return AuthService.getCurrentUser();
};

// Función para obtener el perfil del usuario actual
export const getCurrentProfile = async () => {
  return AuthService.getCurrentUser();
};

// Función para verificar si el usuario tiene un rol específico
export const hasRole = (requiredRole: string) => {
  return AuthService.hasRole(requiredRole as User['role']);
};

// Función para verificar si el usuario puede acceder a un recurso
export const canAccess = (resource: string, action: string) => {
  return AuthService.canAccess(resource, action);
};