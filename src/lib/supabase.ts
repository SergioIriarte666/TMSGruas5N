import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Función para obtener el perfil del usuario actual
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

// Función para verificar si el usuario tiene un rol específico
export const hasRole = async (requiredRole: string) => {
  const profile = await getCurrentProfile();
  
  if (!profile) return false;
  
  const roleHierarchy = { 
    admin: 4, 
    manager: 3, 
    operator: 2, 
    viewer: 1, 
    client: 1 
  };
  
  return roleHierarchy[profile.role as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy];
};

// Función para verificar si el usuario puede acceder a un recurso
export const canAccess = async (resource: string, action: string) => {
  const profile = await getCurrentProfile();
  
  if (!profile) return false;
  
  // Admin tiene acceso a todo
  if (profile.role === 'admin') return true;
  
  // Manager tiene acceso a casi todo
  if (profile.role === 'manager') {
    if (resource === 'services' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'inspections' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'clients' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'operators' && ['read', 'create'].includes(action)) return true;
    if (resource === 'tow-trucks' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'reports' && action === 'read') return true;
    if (resource === 'billing' && ['read', 'create'].includes(action)) return true;
    return false;
  }
  
  // Operator tiene acceso limitado
  if (profile.role === 'operator') {
    if (resource === 'services' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'inspections' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'clients' && action === 'read') return true;
    if (resource === 'tow-trucks' && action === 'read') return true;
    return false;
  }
  
  // Viewer solo puede ver
  if (profile.role === 'viewer') {
    return action === 'read';
  }
  
  // Client tiene acceso muy limitado
  if (profile.role === 'client') {
    if (resource === 'portal-cliente') return true;
    if (resource === 'services' && ['read', 'create'].includes(action)) return true;
    if (resource === 'invoices' && action === 'read') return true;
    return false;
  }
  
  return false;
};