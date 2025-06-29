import { v4 as uuidv4 } from 'uuid';
import { Service } from '@/types';
import { MOCK_SERVICES } from '@/data/mockData';

// Copia local de los datos para simular una base de datos
let services = [...MOCK_SERVICES];

// Obtener todos los servicios
export const getServices = async (): Promise<Service[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...services];
};

// Obtener un servicio por ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const service = services.find(s => s.id === id);
  return service || null;
};

// Crear un nuevo servicio
export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generar número de servicio si no se proporciona
  let serviceNumber = service.service_number;
  if (!serviceNumber) {
    const nextNumber = services.length + 1;
    serviceNumber = `SRV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;
  }
  
  const newService: Service = {
    id: uuidv4(),
    service_number: serviceNumber,
    ...service,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  services.push(newService);
  return newService;
};

// Actualizar un servicio existente
export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = services.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error(`Servicio con ID ${id} no encontrado`);
  }
  
  const updatedService = {
    ...services[index],
    ...service,
    updated_at: new Date().toISOString()
  };
  
  services[index] = updatedService;
  return updatedService;
};

// Eliminar un servicio
export const deleteService = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = services.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error(`Servicio con ID ${id} no encontrado`);
  }
  
  services.splice(index, 1);
};

// Buscar servicios por término
export const searchServices = async (term: string): Promise<Service[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const searchTerm = term.toLowerCase();
  return services.filter(service => 
    service.service_number.toLowerCase().includes(searchTerm) ||
    service.description.toLowerCase().includes(searchTerm) ||
    (service.folio && service.folio.toLowerCase().includes(searchTerm))
  );
};

// Obtener servicios por cliente
export const getServicesByClient = async (clientId: string): Promise<Service[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return services.filter(service => service.client_id === clientId);
};

// Obtener servicios por operador
export const getServicesByOperator = async (operatorId: string): Promise<Service[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return services.filter(service => service.operator_id === operatorId);
};

// Obtener servicios por estado
export const getServicesByStatus = async (status: Service['status']): Promise<Service[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return services.filter(service => service.status === status);
};

// Actualizar el estado de un servicio
export const updateServiceStatus = async (id: string, status: Service['status']): Promise<Service> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = services.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error(`Servicio con ID ${id} no encontrado`);
  }
  
  const updates: Partial<Service> = { status };
  
  // Si el estado es 'in_progress', agregar la hora de inicio
  if (status === 'in_progress' && !services[index].started_time) {
    updates.started_time = new Date().toTimeString().slice(0, 5);
  }
  
  // Si el estado es 'completed', agregar la hora de finalización
  if (status === 'completed' && !services[index].completed_time) {
    updates.completed_time = new Date().toTimeString().slice(0, 5);
  }
  
  const updatedService = {
    ...services[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  services[index] = updatedService;
  return updatedService;
};