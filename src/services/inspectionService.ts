import { supabase } from '@/lib/supabase';
import { ServiceInspection } from '@/types';

// Obtener todas las inspecciones
export const getInspections = async (): Promise<ServiceInspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
  
  return data as ServiceInspection[];
};

// Obtener una inspección por ID
export const getInspectionById = async (id: string): Promise<ServiceInspection | null> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};

// Obtener inspecciones por servicio
export const getInspectionsByService = async (serviceId: string): Promise<ServiceInspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching inspections by service:', error);
    throw error;
  }
  
  return data as ServiceInspection[];
};

// Crear una nueva inspección
export const createInspection = async (inspection: Omit<ServiceInspection, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceInspection> => {
  // Subir fotos a Supabase Storage si es necesario
  let photosBefore: string[] = [];
  let photosAfter: string[] = [];
  
  if (inspection.photos_before && inspection.photos_before.length > 0) {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
    // Por ahora, simplemente pasamos los nombres de archivo
    photosBefore = inspection.photos_before;
  }
  
  if (inspection.photos_after && inspection.photos_after.length > 0) {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
    photosAfter = inspection.photos_after;
  }
  
  const { data, error } = await supabase
    .from('inspections')
    .insert([{
      ...inspection,
      photos_before: photosBefore,
      photos_after: photosAfter
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};

// Actualizar una inspección existente
export const updateInspection = async (id: string, inspection: Partial<ServiceInspection>): Promise<ServiceInspection> => {
  // Subir fotos a Supabase Storage si es necesario
  if (inspection.photos_before && typeof inspection.photos_before[0] !== 'string') {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
    // Por ahora, simplemente pasamos los nombres de archivo
  }
  
  if (inspection.photos_after && typeof inspection.photos_after[0] !== 'string') {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
  }
  
  const { data, error } = await supabase
    .from('inspections')
    .update(inspection)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};

// Eliminar una inspección
export const deleteInspection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inspections')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting inspection:', error);
    throw error;
  }
};

// Completar una inspección (agregar condición después del servicio)
export const completeInspection = async (
  id: string, 
  vehicleConditionAfter: ServiceInspection['vehicle_condition_after'],
  clientSignatureName?: string,
  clientSignatureImage?: string,
  photosAfter?: string[]
): Promise<ServiceInspection> => {
  const { data, error } = await supabase
    .from('inspections')
    .update({
      vehicle_condition_after: vehicleConditionAfter,
      client_signature_name: clientSignatureName,
      client_signature_image: clientSignatureImage,
      photos_after: photosAfter
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error completing inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};