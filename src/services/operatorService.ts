import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types';
import { MOCK_OPERATORS, ExtendedUser } from '@/data/mockData';
import { AuthService } from '@/lib/auth';

// Copia local de los datos para simular una base de datos
let operators = [...MOCK_OPERATORS];

// Obtener todos los operadores
export const getOperators = async (): Promise<User[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...operators];
};

// Obtener un operador por ID
export const getOperatorById = async (id: string): Promise<User | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const operator = operators.find(o => o.id === id);
  return operator || null;
};

// Crear un nuevo operador
export const createOperator = async (operator: Omit<ExtendedUser, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<User> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En un caso real, aquí se crearía un usuario en el sistema de autenticación
  // y luego se crearía un perfil asociado a ese usuario
  
  const newOperator: ExtendedUser = {
    id: uuidv4(),
    ...operator,
    status: 'active',
    services_completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  operators.push(newOperator);
  return newOperator;
};

// Actualizar un operador existente
export const updateOperator = async (id: string, operator: Partial<User>): Promise<User> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = operators.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error(`Operador con ID ${id} no encontrado`);
  }
  
  const updatedOperator = {
    ...operators[index],
    ...operator,
    updated_at: new Date().toISOString()
  };
  
  operators[index] = updatedOperator;
  return updatedOperator;
};

// Eliminar un operador
export const deleteOperator = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = operators.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error(`Operador con ID ${id} no encontrado`);
  }
  
  operators.splice(index, 1);
};

// Obtener operadores por rol
export const getOperatorsByRole = async (role: User['role']): Promise<User[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return operators.filter(o => o.role === role);
};

// Actualizar el estado de un operador
export const updateOperatorStatus = async (id: string, status: 'active' | 'inactive' | 'on_leave'): Promise<User> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = operators.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error(`Operador con ID ${id} no encontrado`);
  }
  
  const updatedOperator = {
    ...operators[index],
    status,
    updated_at: new Date().toISOString()
  };
  
  operators[index] = updatedOperator;
  return updatedOperator;
};

// Incrementar el contador de servicios completados
export const incrementOperatorServicesCompleted = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = operators.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error(`Operador con ID ${id} no encontrado`);
  }
  
  const currentCount = operators[index].services_completed || 0;
  
  operators[index] = {
    ...operators[index],
    services_completed: currentCount + 1,
    updated_at: new Date().toISOString()
  };
};