import { v4 as uuidv4 } from 'uuid';
import { Client } from '@/types';
import { MOCK_CLIENTS } from '@/data/mockData';

// Copia local de los datos para simular una base de datos
let clients = [...MOCK_CLIENTS];

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...clients];
};

// Obtener un cliente por ID
export const getClientById = async (id: string): Promise<Client | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const client = clients.find(c => c.id === id);
  return client || null;
};

// Crear un nuevo cliente
export const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newClient: Client = {
    id: uuidv4(),
    ...client,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  clients.push(newClient);
  return newClient;
};

// Actualizar un cliente existente
export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error(`Cliente con ID ${id} no encontrado`);
  }
  
  const updatedClient = {
    ...clients[index],
    ...client,
    updated_at: new Date().toISOString()
  };
  
  clients[index] = updatedClient;
  return updatedClient;
};

// Eliminar un cliente
export const deleteClient = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error(`Cliente con ID ${id} no encontrado`);
  }
  
  clients.splice(index, 1);
};

// Buscar clientes por término
export const searchClients = async (term: string): Promise<Client[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const searchTerm = term.toLowerCase();
  return clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm) ||
    client.document.toLowerCase().includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm)) ||
    client.phone.toLowerCase().includes(searchTerm)
  );
};