import { v4 as uuidv4 } from 'uuid';
import { TowTruck } from '@/types';
import { MOCK_TOW_TRUCKS } from '@/data/mockData';

// Copia local de los datos para simular una base de datos
let towTrucks = [...MOCK_TOW_TRUCKS];

// Obtener todas las grúas
export const getTowTrucks = async (): Promise<TowTruck[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...towTrucks];
};

// Obtener una grúa por ID
export const getTowTruckById = async (id: string): Promise<TowTruck | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const towTruck = towTrucks.find(t => t.id === id);
  return towTruck || null;
};

// Crear una nueva grúa
export const createTowTruck = async (towTruck: Omit<TowTruck, 'id' | 'created_at' | 'updated_at'>): Promise<TowTruck> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newTowTruck: TowTruck = {
    id: uuidv4(),
    ...towTruck,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  towTrucks.push(newTowTruck);
  return newTowTruck;
};

// Actualizar una grúa existente
export const updateTowTruck = async (id: string, towTruck: Partial<TowTruck>): Promise<TowTruck> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = towTrucks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error(`Grúa con ID ${id} no encontrada`);
  }
  
  const updatedTowTruck = {
    ...towTrucks[index],
    ...towTruck,
    updated_at: new Date().toISOString()
  };
  
  towTrucks[index] = updatedTowTruck;
  return updatedTowTruck;
};

// Eliminar una grúa
export const deleteTowTruck = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = towTrucks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error(`Grúa con ID ${id} no encontrada`);
  }
  
  towTrucks.splice(index, 1);
};

// Obtener grúas disponibles
export const getAvailableTowTrucks = async (): Promise<TowTruck[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return towTrucks.filter(t => t.status === 'available');
};

// Actualizar el estado de una grúa
export const updateTowTruckStatus = async (id: string, status: TowTruck['status']): Promise<TowTruck> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = towTrucks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error(`Grúa con ID ${id} no encontrada`);
  }
  
  const updatedTowTruck = {
    ...towTrucks[index],
    status,
    updated_at: new Date().toISOString()
  };
  
  towTrucks[index] = updatedTowTruck;
  return updatedTowTruck;
};

// Asignar operador a una grúa
export const assignOperatorToTowTruck = async (towTruckId: string, operatorId: string | null): Promise<TowTruck> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = towTrucks.findIndex(t => t.id === towTruckId);
  if (index === -1) {
    throw new Error(`Grúa con ID ${towTruckId} no encontrada`);
  }
  
  const updatedTowTruck = {
    ...towTrucks[index],
    current_operator_id: operatorId,
    updated_at: new Date().toISOString()
  };
  
  towTrucks[index] = updatedTowTruck;
  return updatedTowTruck;
};