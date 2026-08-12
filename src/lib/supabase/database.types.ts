export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_row: Json | null
          old_row: Json | null
          organization_id: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_row?: Json | null
          old_row?: Json | null
          organization_id: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_row?: Json | null
          old_row?: Json | null
          organization_id?: string
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cash_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction: Database["public"]["Enums"]["cash_direction"]
          entry_date: string
          id: string
          organization_id: string
          quote_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction: Database["public"]["Enums"]["cash_direction"]
          entry_date?: string
          id?: string
          organization_id: string
          quote_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction?: Database["public"]["Enums"]["cash_direction"]
          entry_date?: string
          id?: string
          organization_id?: string
          quote_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          doc_number: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fixed_costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          custom_factor: number | null
          description: string
          due_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          organization_id: string
          periodicity: Database["public"]["Enums"]["periodicity"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          custom_factor?: number | null
          description: string
          due_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id: string
          periodicity?: Database["public"]["Enums"]["periodicity"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          custom_factor?: number | null
          description?: string
          due_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string
          periodicity?: Database["public"]["Enums"]["periodicity"]
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          desired_profit_month: number
          id: string
          organization_id: string
          planned_services: number | null
          professional_id: string | null
          reference_month: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          desired_profit_month?: number
          id?: string
          organization_id: string
          planned_services?: number | null
          professional_id?: string | null
          reference_month?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          desired_profit_month?: number
          id?: string
          organization_id?: string
          planned_services?: number | null
          professional_id?: string | null
          reference_month?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          document_number: string | null
          id: string
          organization_id: string
          product_id: string
          quantity: number
          reason: string | null
          related_service_id: string | null
          supplier_id: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_number?: string | null
          id?: string
          organization_id: string
          product_id: string
          quantity: number
          reason?: string | null
          related_service_id?: string | null
          supplier_id?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_number?: string | null
          id?: string
          organization_id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          related_service_id?: string | null
          supplier_id?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          unit_cost?: number | null
        }
        Relationships: []
      }
      labor_rates: {
        Row: {
          commission_percent: number | null
          created_at: string
          daily_value: number | null
          hourly_value: number | null
          id: string
          is_active: boolean
          labor_type_id: string
          model: Database["public"]["Enums"]["labor_model"]
          monthly_value: number | null
          organization_id: string
          professional_id: string
          service_value: number | null
        }
        Insert: {
          commission_percent?: number | null
          created_at?: string
          daily_value?: number | null
          hourly_value?: number | null
          id?: string
          is_active?: boolean
          labor_type_id: string
          model: Database["public"]["Enums"]["labor_model"]
          monthly_value?: number | null
          organization_id: string
          professional_id: string
          service_value?: number | null
        }
        Update: {
          commission_percent?: number | null
          created_at?: string
          daily_value?: number | null
          hourly_value?: number | null
          id?: string
          is_active?: boolean
          labor_type_id?: string
          model?: Database["public"]["Enums"]["labor_model"]
          monthly_value?: number | null
          organization_id?: string
          professional_id?: string
          service_value?: number | null
        }
        Relationships: []
      }
      labor_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          can_read: boolean
          can_write: boolean
          id: string
          membership_id: string
          module: string
          organization_id: string
        }
        Insert: {
          can_read?: boolean
          can_write?: boolean
          id?: string
          membership_id: string
          module: string
          organization_id: string
        }
        Update: {
          can_read?: boolean
          can_write?: boolean
          id?: string
          membership_id?: string
          module?: string
          organization_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          available_hours_per_day: number
          created_at: string
          currency: string
          doc_number: string | null
          email: string | null
          id: string
          logo_path: string | null
          margin_min: number
          margin_premium: number
          margin_recommended: number
          name: string
          phone: string | null
          productive_hours_per_day: number
          profession_id: string | null
          tax_rate: number
          trade_name: string | null
          updated_at: string
          working_days_per_month: number
        }
        Insert: {
          address?: string | null
          available_hours_per_day?: number
          created_at?: string
          currency?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          logo_path?: string | null
          margin_min?: number
          margin_premium?: number
          margin_recommended?: number
          name: string
          phone?: string | null
          productive_hours_per_day?: number
          profession_id?: string | null
          tax_rate?: number
          trade_name?: string | null
          updated_at?: string
          working_days_per_month?: number
        }
        Update: {
          address?: string | null
          available_hours_per_day?: number
          created_at?: string
          currency?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          logo_path?: string | null
          margin_min?: number
          margin_premium?: number
          margin_recommended?: number
          name?: string
          phone?: string | null
          productive_hours_per_day?: number
          profession_id?: string | null
          tax_rate?: number
          trade_name?: string | null
          updated_at?: string
          working_days_per_month?: number
        }
        Relationships: []
      }
      product_categories: {
        Row: { id: string; name: string; organization_id: string }
        Insert: { id?: string; name: string; organization_id: string }
        Update: { id?: string; name?: string; organization_id?: string }
        Relationships: []
      }
      products: {
        Row: {
          acquisition_cost: number
          avg_cost: number
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          reference_price: number | null
          sku: string | null
          stock_current: number
          stock_max: number | null
          stock_min: number
          supplier_id: string | null
          unit: Database["public"]["Enums"]["unit_measure"]
          updated_at: string
        }
        Insert: {
          acquisition_cost?: number
          avg_cost?: number
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          reference_price?: number | null
          sku?: string | null
          stock_current?: number
          stock_max?: number | null
          stock_min?: number
          supplier_id?: string | null
          unit?: Database["public"]["Enums"]["unit_measure"]
          updated_at?: string
        }
        Update: {
          acquisition_cost?: number
          avg_cost?: number
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          reference_price?: number | null
          sku?: string | null
          stock_current?: number
          stock_max?: number | null
          stock_min?: number
          supplier_id?: string | null
          unit?: Database["public"]["Enums"]["unit_measure"]
          updated_at?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          bond_type: string | null
          created_at: string
          doc_number: string | null
          email: string | null
          id: string
          internal_code: string | null
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          profession_id: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          bond_type?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          internal_code?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          profession_id?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          bond_type?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          internal_code?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          profession_id?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      professions: {
        Row: { id: string; is_active: boolean; name: string; slug: string }
        Insert: { id?: string; is_active?: boolean; name: string; slug: string }
        Update: { id?: string; is_active?: boolean; name?: string; slug?: string }
        Relationships: []
      }
      profiles: {
        Row: { created_at: string; email: string | null; full_name: string | null; id: string }
        Insert: { created_at?: string; email?: string | null; full_name?: string | null; id: string }
        Update: { created_at?: string; email?: string | null; full_name?: string | null; id?: string }
        Relationships: []
      }
      quote_items: {
        Row: {
          description: string
          formation_id: string | null
          id: string
          line_total: number
          organization_id: string
          quantity: number
          quote_id: string
          service_id: string | null
          unit_price: number
        }
        Insert: {
          description: string
          formation_id?: string | null
          id?: string
          line_total?: number
          organization_id: string
          quantity?: number
          quote_id: string
          service_id?: string | null
          unit_price?: number
        }
        Update: {
          description?: string
          formation_id?: string | null
          id?: string
          line_total?: number
          organization_id?: string
          quantity?: number
          quote_id?: string
          service_id?: string | null
          unit_price?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount_amount: number
          id: string
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          terms: string | null
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      service_price_components: {
        Row: {
          amount: number
          created_at: string
          formation_id: string
          hours: number | null
          id: string
          kind: Database["public"]["Enums"]["price_component_kind"]
          label: string
          labor_rate_id: string | null
          organization_id: string
          product_id: string | null
          professional_id: string | null
          quantity: number | null
          unit_cost: number | null
        }
        Insert: {
          amount?: number
          created_at?: string
          formation_id: string
          hours?: number | null
          id?: string
          kind: Database["public"]["Enums"]["price_component_kind"]
          label: string
          labor_rate_id?: string | null
          organization_id: string
          product_id?: string | null
          professional_id?: string | null
          quantity?: number | null
          unit_cost?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          formation_id?: string
          hours?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["price_component_kind"]
          label?: string
          labor_rate_id?: string | null
          organization_id?: string
          product_id?: string | null
          professional_id?: string | null
          quantity?: number | null
          unit_cost?: number | null
        }
        Relationships: []
      }
      service_price_formations: {
        Row: {
          commission_percent: number
          computed_at: string
          cost_total: number
          created_at: string
          fixed_cost_per_hour: number
          id: string
          margin_min: number
          margin_premium: number
          margin_recommended: number
          organization_id: string
          price_min: number
          price_premium: number
          price_recommended: number
          service_id: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          computed_at?: string
          cost_total?: number
          created_at?: string
          fixed_cost_per_hour?: number
          id?: string
          margin_min: number
          margin_premium: number
          margin_recommended: number
          organization_id: string
          price_min?: number
          price_premium?: number
          price_recommended?: number
          service_id: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          computed_at?: string
          cost_total?: number
          created_at?: string
          fixed_cost_per_hour?: number
          id?: string
          margin_min?: number
          margin_premium?: number
          margin_recommended?: number
          organization_id?: string
          price_min?: number
          price_premium?: number
          price_recommended?: number
          service_id?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          estimated_hours: number
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          estimated_hours?: number
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          estimated_hours?: number
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: { data: Json; organization_id: string; updated_at: string }
        Insert: { data?: Json; organization_id: string; updated_at?: string }
        Update: { data?: Json; organization_id?: string; updated_at?: string }
        Relationships: []
      }
      suppliers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
        }
        Relationships: []
      }
      variable_costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          notes: string | null
          organization_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      audit_log: {
        Args: {
          p_action: string
          p_new?: Json
          p_old?: Json
          p_org: string
          p_record: string
          p_table: string
        }
        Returns: undefined
      }
      auth_can_write: { Args: { org: string }; Returns: boolean }
      auth_org_ids: { Args: never; Returns: string[] }
      create_organization: {
        Args: { p_name: string; p_profession?: string }
        Returns: string
      }
      register_inventory_movement: {
        Args: {
          p_document?: string
          p_org: string
          p_product: string
          p_qty: number
          p_reason?: string
          p_service?: string
          p_supplier?: string
          p_type: Database["public"]["Enums"]["movement_type"]
          p_unit_cost?: number
        }
        Returns: string
      }
    }
    Enums: {
      cash_direction: "in" | "out"
      labor_model:
        | "hourly"
        | "per_service"
        | "commission_percent"
        | "monthly_cost"
        | "daily_cost"
      member_role: "owner" | "admin" | "professional" | "staff"
      movement_type: "in" | "out" | "adjustment"
      periodicity: "monthly" | "weekly" | "yearly" | "daily" | "custom"
      price_component_kind: "labor" | "material" | "additional"
      quote_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      unit_measure:
        | "unit"
        | "ml"
        | "liter"
        | "kg"
        | "gram"
        | "meter"
        | "box"
        | "pack"
        | "hour"
        | "other"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
