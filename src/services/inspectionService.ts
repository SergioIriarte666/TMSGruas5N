import { v4 as uuidv4 } from 'uuid';
import { ServiceInspection } from '@/types';
import { MOCK_INSPECTIONS } from '@/data/mockData';

// Copia local de los datos para simular una base de datos
let inspections = [...MOCK_INSPECTIONS];

// Obtener todas las inspecciones
export const getInspections = async (): Promise<ServiceInspection[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...inspections];
};

// Obtener una inspección por ID
export const getInspectionById = async (id: string): Promise<ServiceInspection | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const inspection = inspections.find(i => i.id === id);
  return inspection || null;
};

// Obtener inspecciones por servicio
export const getInspectionsByService = async (serviceId: string): Promise<ServiceInspection[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return inspections.filter(i => i.service_id === serviceId);
};

// Crear una nueva inspección
export const createInspection = async (inspection: Omit<ServiceInspection, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceInspection> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En un caso real, aquí se subirían las fotos a un servicio de almacenamiento
  // y se guardarían las URLs en la base de datos
  
  const newInspection: ServiceInspection = {
    id: uuidv4(),
    ...inspection,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  inspections.push(newInspection);
  return newInspection;
};

// Actualizar una inspección existente
export const updateInspection = async (id: string, inspection: Partial<ServiceInspection>): Promise<ServiceInspection> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Inspección con ID ${id} no encontrada`);
  }
  
  // En un caso real, aquí se subirían las fotos nuevas a un servicio de almacenamiento
  // y se actualizarían las URLs en la base de datos
  
  const updatedInspection = {
    ...inspections[index],
    ...inspection,
    updated_at: new Date().toISOString()
  };
  
  inspections[index] = updatedInspection;
  return updatedInspection;
};

// Eliminar una inspección
export const deleteInspection = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Inspección con ID ${id} no encontrada`);
  }
  
  // En un caso real, aquí se eliminarían las fotos del servicio de almacenamiento
  
  inspections.splice(index, 1);
};

// Completar una inspección (agregar condición después del servicio)
export const completeInspection = async (
  id: string, 
  vehicleConditionAfter: ServiceInspection['vehicle_condition_after'],
  clientSignatureName?: string,
  clientSignatureImage?: string,
  photosAfter?: string[]
): Promise<ServiceInspection> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Inspección con ID ${id} no encontrada`);
  }
  
  // En un caso real, aquí se subirían las fotos nuevas a un servicio de almacenamiento
  // y se actualizarían las URLs en la base de datos
  
  const updatedInspection = {
    ...inspections[index],
    vehicle_condition_after: vehicleConditionAfter,
    client_signature_name: clientSignatureName || inspections[index].client_signature_name,
    client_signature_image: clientSignatureImage || inspections[index].client_signature_image,
    photos_after: photosAfter || inspections[index].photos_after,
    updated_at: new Date().toISOString()
  };
  
  inspections[index] = updatedInspection;
  return updatedInspection;
};