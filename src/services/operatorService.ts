import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// Obtener todos los operadores
export const getOperators = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'manager', 'operator', 'viewer'])
    .order('name');
  
  if (error) {
    console.error('Error fetching operators:', error);
    throw error;
  }
  
  return data as User[];
};

// Obtener un operador por ID
export const getOperatorById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching operator:', error);
    throw error;
  }
  
  return data as User;
};

// Crear un nuevo operador (esto requiere crear un usuario en Auth y luego un perfil)
export const createOperator = async (operator: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<User> => {
  // Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: operator.email,
    password: operator.password,
    email_confirm: true
  });
  
  if (authError) {
    console.error('Error creating operator auth user:', authError);
    throw authError;
  }
  
  // Crear perfil
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      email: operator.email,
      name: operator.name,
      role: operator.role,
      phone: operator.phone,
      license_number: operator.license_number,
      license_expiry: operator.license_expiry,
      occupational_exam_expiry: operator.occupational_exam_expiry,
      psychosensometric_exam_expiry: operator.psychosensometric_exam_expiry,
      emergency_contact: operator.emergency_contact,
      emergency_phone: operator.emergency_phone,
      status: 'active'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating operator profile:', error);
    throw error;
  }
  
  return data as User;
};

// Actualizar un operador existente
export const updateOperator = async (id: string, operator: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(operator)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating operator:', error);
    throw error;
  }
  
  return data as User;
};

// Eliminar un operador
export const deleteOperator = async (id: string): Promise<void> => {
  // Eliminar usuario en Auth (esto eliminará en cascada el perfil)
  const { error } = await supabase.auth.admin.deleteUser(id);
  
  if (error) {
    console.error('Error deleting operator:', error);
    throw error;
  }
};

// Obtener operadores por rol
export const getOperatorsByRole = async (role: User['role']): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('name');
  
  if (error) {
    console.error('Error fetching operators by role:', error);
    throw error;
  }
  
  return data as User[];
};

// Actualizar el estado de un operador
export const updateOperatorStatus = async (id: string, status: 'active' | 'inactive' | 'on_leave'): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating operator status:', error);
    throw error;
  }
  
  return data as User;
};

// Incrementar el contador de servicios completados
export const incrementOperatorServicesCompleted = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_operator_services', {
    operator_id: id
  });
  
  if (error) {
    console.error('Error incrementing operator services:', error);
    throw error;
  }
};