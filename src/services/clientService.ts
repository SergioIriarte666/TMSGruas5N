import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
  
  return data as Client[];
};

// Obtener un cliente por ID
export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
  
  return data as Client;
};

// Crear un nuevo cliente
export const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }
  
  return data as Client;
};

// Actualizar un cliente existente
export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  
  return data as Client;
};

// Eliminar un cliente
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// Buscar clientes por término
export const searchClients = async (term: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${term}%,document.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
    .order('name');
  
  if (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
  
  return data as Client[];
};