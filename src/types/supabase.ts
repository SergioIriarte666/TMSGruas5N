export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          phone: string | null
          avatar_url: string | null
          license_number: string | null
          license_expiry: string | null
          occupational_exam_expiry: string | null
          psychosensometric_exam_expiry: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          last_login: string | null
          services_completed: number | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: string
          phone?: string | null
          avatar_url?: string | null
          license_number?: string | null
          license_expiry?: string | null
          occupational_exam_expiry?: string | null
          psychosensometric_exam_expiry?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          last_login?: string | null
          services_completed?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          license_number?: string | null
          license_expiry?: string | null
          occupational_exam_expiry?: string | null
          psychosensometric_exam_expiry?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          last_login?: string | null
          services_completed?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          document: string
          document_type: string
          phone: string
          email: string | null
          address: string
          city: string
          province: string
          postal_code: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          document: string
          document_type: string
          phone: string
          email?: string | null
          address: string
          city: string
          province: string
          postal_code: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          document?: string
          document_type?: string
          phone?: string
          email?: string | null
          address?: string
          city?: string
          province?: string
          postal_code?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tow_trucks: {
        Row: {
          id: string
          name: string
          license_plate: string
          brand: string
          model: string
          year: number
          capacity_tons: number
          truck_type: string
          status: string
          current_operator_id: string | null
          circulation_permit_expiry: string | null
          soap_expiry: string | null
          technical_review_expiry: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          license_plate: string
          brand: string
          model: string
          year: number
          capacity_tons: number
          truck_type: string
          status: string
          current_operator_id?: string | null
          circulation_permit_expiry?: string | null
          soap_expiry?: string | null
          technical_review_expiry?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          license_plate?: string
          brand?: string
          model?: string
          year?: number
          capacity_tons?: number
          truck_type?: string
          status?: string
          current_operator_id?: string | null
          circulation_permit_expiry?: string | null
          soap_expiry?: string | null
          technical_review_expiry?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          service_number: string
          folio: string | null
          client_id: string
          vehicle_license_plate: string | null
          vehicle_brand: string | null
          vehicle_model: string | null
          tow_truck_id: string | null
          operator_id: string | null
          service_type: string
          origin_address: string
          origin_coordinates: Json | null
          destination_address: string | null
          destination_coordinates: Json | null
          distance_km: number | null
          service_date: string
          requested_time: string
          started_time: string | null
          completed_time: string | null
          status: string
          priority: string
          base_cost: number
          additional_costs: Json | null
          total_cost: number
          description: string
          notes: string | null
          requires_inspection: boolean | null
          special_fields: Json | null
          is_billed: boolean | null
          bill_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_number: string
          folio?: string | null
          client_id: string
          vehicle_license_plate?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          tow_truck_id?: string | null
          operator_id?: string | null
          service_type: string
          origin_address: string
          origin_coordinates?: Json | null
          destination_address?: string | null
          destination_coordinates?: Json | null
          distance_km?: number | null
          service_date: string
          requested_time: string
          started_time?: string | null
          completed_time?: string | null
          status: string
          priority: string
          base_cost: number
          additional_costs?: Json | null
          total_cost: number
          description: string
          notes?: string | null
          requires_inspection?: boolean | null
          special_fields?: Json | null
          is_billed?: boolean | null
          bill_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_number?: string
          folio?: string | null
          client_id?: string
          vehicle_license_plate?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          tow_truck_id?: string | null
          operator_id?: string | null
          service_type?: string
          origin_address?: string
          origin_coordinates?: Json | null
          destination_address?: string | null
          destination_coordinates?: Json | null
          distance_km?: number | null
          service_date?: string
          requested_time?: string
          started_time?: string | null
          completed_time?: string | null
          status?: string
          priority?: string
          base_cost?: number
          additional_costs?: Json | null
          total_cost?: number
          description?: string
          notes?: string | null
          requires_inspection?: boolean | null
          special_fields?: Json | null
          is_billed?: boolean | null
          bill_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          service_id: string
          vehicle_condition_before: Json
          vehicle_condition_after: Json | null
          operator_signature_name: string
          client_signature_name: string | null
          operator_signature_image: string | null
          client_signature_image: string | null
          photos_before: string[] | null
          photos_after: string[] | null
          inspection_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          vehicle_condition_before: Json
          vehicle_condition_after?: Json | null
          operator_signature_name: string
          client_signature_name?: string | null
          operator_signature_image?: string | null
          client_signature_image?: string | null
          photos_before?: string[] | null
          photos_after?: string[] | null
          inspection_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          vehicle_condition_before?: Json
          vehicle_condition_after?: Json | null
          operator_signature_name?: string
          client_signature_name?: string | null
          operator_signature_image?: string | null
          client_signature_image?: string | null
          photos_before?: string[] | null
          photos_after?: string[] | null
          inspection_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          invoice_type: string
          folio: number
          client_id: string
          service_ids: string[] | null
          issue_date: string
          due_date: string | null
          subtotal: number
          iva_amount: number
          total_amount: number
          status: string
          payment_status: string
          client_rut: string
          client_name: string
          client_address: string
          client_city: string
          client_region: string
          sii_status: string | null
          sii_track_id: string | null
          sii_response: string | null
          electronic_signature: string | null
          pdf_url: string | null
          xml_url: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          invoice_type: string
          folio: number
          client_id: string
          service_ids?: string[] | null
          issue_date: string
          due_date?: string | null
          subtotal: number
          iva_amount: number
          total_amount: number
          status: string
          payment_status: string
          client_rut: string
          client_name: string
          client_address: string
          client_city: string
          client_region: string
          sii_status?: string | null
          sii_track_id?: string | null
          sii_response?: string | null
          electronic_signature?: string | null
          pdf_url?: string | null
          xml_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          invoice_type?: string
          folio?: number
          client_id?: string
          service_ids?: string[] | null
          issue_date?: string
          due_date?: string | null
          subtotal?: number
          iva_amount?: number
          total_amount?: number
          status?: string
          payment_status?: string
          client_rut?: string
          client_name?: string
          client_address?: string
          client_city?: string
          client_region?: string
          sii_status?: string | null
          sii_track_id?: string | null
          sii_response?: string | null
          electronic_signature?: string | null
          pdf_url?: string | null
          xml_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          discount_percent: number | null
          discount_amount: number | null
          subtotal: number
          iva_rate: number
          iva_amount: number
          total: number
          service_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          discount_percent?: number | null
          discount_amount?: number | null
          subtotal: number
          iva_rate: number
          iva_amount: number
          total: number
          service_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          discount_percent?: number | null
          discount_amount?: number | null
          subtotal?: number
          iva_rate?: number
          iva_amount?: number
          total?: number
          service_id?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          start: string
          end: string
          all_day: boolean | null
          description: string | null
          location: string | null
          type: string
          status: string
          assigned_to: string[] | null
          related_service_id: string | null
          related_client_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          start: string
          end: string
          all_day?: boolean | null
          description?: string | null
          location?: string | null
          type: string
          status: string
          assigned_to?: string[] | null
          related_service_id?: string | null
          related_client_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          start?: string
          end?: string
          all_day?: boolean | null
          description?: string | null
          location?: string | null
          type?: string
          status?: string
          assigned_to?: string[] | null
          related_service_id?: string | null
          related_client_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_operator: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_viewer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_client: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}