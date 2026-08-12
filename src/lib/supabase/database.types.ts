export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          active: boolean
          bank_code: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          bank_code: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          bank_code?: string
          id?: string
          name?: string
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
        Relationships: [
          {
            foreignKeyName: "cash_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_entries_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_categories: {
        Row: {
          active: boolean
          code: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          organization_id: string
          parent_id: string | null
          type: Database["public"]["Enums"]["classification_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          organization_id: string
          parent_id?: string | null
          type: Database["public"]["Enums"]["classification_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          organization_id?: string
          parent_id?: string | null
          type?: Database["public"]["Enums"]["classification_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classification_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "classification_categories"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          account_number: string | null
          account_type: Database["public"]["Enums"]["fin_account_type"]
          active: boolean
          agency: string | null
          bank_id: string | null
          created_at: string
          digit: string | null
          id: string
          initial_balance: number
          name: string
          organization_id: string
          owner_type: Database["public"]["Enums"]["fin_account_owner"]
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_type?: Database["public"]["Enums"]["fin_account_type"]
          active?: boolean
          agency?: string | null
          bank_id?: string | null
          created_at?: string
          digit?: string | null
          id?: string
          initial_balance?: number
          name: string
          organization_id: string
          owner_type?: Database["public"]["Enums"]["fin_account_owner"]
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_type?: Database["public"]["Enums"]["fin_account_type"]
          active?: boolean
          agency?: string | null
          bank_id?: string | null
          created_at?: string
          digit?: string | null
          id?: string
          initial_balance?: number
          name?: string
          organization_id?: string
          owner_type?: Database["public"]["Enums"]["fin_account_owner"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fixed_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_invoices: {
        Row: {
          chave: string
          created_at: string
          created_by: string | null
          emit_cnpj: string | null
          emit_nome: string | null
          id: string
          issued_at: string | null
          items_count: number
          model: string | null
          numero: string | null
          organization_id: string
          serie: string | null
          supplier_id: string | null
          total: number
        }
        Insert: {
          chave: string
          created_at?: string
          created_by?: string | null
          emit_cnpj?: string | null
          emit_nome?: string | null
          id?: string
          issued_at?: string | null
          items_count?: number
          model?: string | null
          numero?: string | null
          organization_id: string
          serie?: string | null
          supplier_id?: string | null
          total?: number
        }
        Update: {
          chave?: string
          created_at?: string
          created_by?: string | null
          emit_cnpj?: string | null
          emit_nome?: string | null
          id?: string
          issued_at?: string | null
          items_count?: number
          model?: string | null
          numero?: string | null
          organization_id?: string
          serie?: string | null
          supplier_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "imported_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_invmov_service"
            columns: ["related_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "labor_rates_labor_type_id_fkey"
            columns: ["labor_type_id"]
            isOneToOne: false
            referencedRelation: "labor_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_rates_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "labor_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "module_permissions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "organizations_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "professionals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      professions: {
        Row: {
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          theme: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          theme?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          theme?: string
        }
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
        Relationships: [
          {
            foreignKeyName: "quote_items_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "service_price_formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "service_price_components_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "service_price_formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_components_labor_rate_id_fkey"
            columns: ["labor_rate_id"]
            isOneToOne: false
            referencedRelation: "labor_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_components_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "service_price_formations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_formations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          data: Json
          organization_id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          organization_id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          doc_number: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_payments: {
        Row: {
          created_at: string
          created_by: string | null
          financial_account_id: string | null
          id: string
          observation: string | null
          organization_id: string
          paid_amount: number
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_reference: string | null
          transaction_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          financial_account_id?: string | null
          id?: string
          observation?: string | null
          organization_id: string
          paid_amount: number
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_reference?: string | null
          transaction_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          financial_account_id?: string | null
          id?: string
          observation?: string | null
          organization_id?: string
          paid_amount?: number
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_reference?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_payments_financial_account_id_fkey"
            columns: ["financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          classification_category_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          description: string
          discount: number
          document_number: string | null
          document_type: Database["public"]["Enums"]["transaction_doc_type"]
          due_date: string
          financial_account_id: string | null
          id: string
          imported_from_xml: boolean
          installment_number: number | null
          installments_total: number | null
          issue_date: string | null
          late_fee: number
          observation: string | null
          organization_id: string
          paid_amount: number
          payment_date: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          supplier_id: string | null
          surcharge_interest: number
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          xml_chave: string | null
        }
        Insert: {
          amount: number
          classification_category_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description: string
          discount?: number
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["transaction_doc_type"]
          due_date: string
          financial_account_id?: string | null
          id?: string
          imported_from_xml?: boolean
          installment_number?: number | null
          installments_total?: number | null
          issue_date?: string | null
          late_fee?: number
          observation?: string | null
          organization_id: string
          paid_amount?: number
          payment_date?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          supplier_id?: string | null
          surcharge_interest?: number
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          xml_chave?: string | null
        }
        Update: {
          amount?: number
          classification_category_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string
          discount?: number
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["transaction_doc_type"]
          due_date?: string
          financial_account_id?: string | null
          id?: string
          imported_from_xml?: boolean
          installment_number?: number | null
          installments_total?: number | null
          issue_date?: string | null
          late_fee?: number
          observation?: string | null
          organization_id?: string
          paid_amount?: number
          payment_date?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          supplier_id?: string | null
          surcharge_interest?: number
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          xml_chave?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_classification_category_id_fkey"
            columns: ["classification_category_id"]
            isOneToOne: false
            referencedRelation: "classification_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_financial_account_id_fkey"
            columns: ["financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "variable_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
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
      register_payment: {
        Args: {
          p_account?: string
          p_amount: number
          p_date: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_obs?: string
          p_receipt?: string
          p_tx: string
        }
        Returns: string
      }
      reverse_payment: { Args: { p_payment: string }; Returns: undefined }
    }
    Enums: {
      cash_direction: "in" | "out"
      classification_type: "expense" | "income"
      fin_account_owner: "company" | "partner"
      fin_account_type:
        | "checking"
        | "savings"
        | "cash"
        | "payment_card"
        | "investment"
        | "other"
      labor_model:
        | "hourly"
        | "per_service"
        | "commission_percent"
        | "monthly_cost"
        | "daily_cost"
      member_role: "owner" | "admin" | "professional" | "staff"
      movement_type: "in" | "out" | "adjustment"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "pix"
        | "credit_card"
        | "debit_card"
        | "boleto"
        | "check"
        | "debit_note"
        | "other"
      periodicity: "monthly" | "weekly" | "yearly" | "daily" | "custom"
      price_component_kind: "labor" | "material" | "additional"
      quote_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      transaction_doc_type:
        | "manual"
        | "nfe"
        | "nfce"
        | "boleto"
        | "receipt"
        | "card_batch"
        | "other"
      transaction_status: "pending" | "partial" | "paid" | "cancelled"
      transaction_type: "payable" | "receivable"
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cash_direction: ["in", "out"],
      classification_type: ["expense", "income"],
      fin_account_owner: ["company", "partner"],
      fin_account_type: [
        "checking",
        "savings",
        "cash",
        "payment_card",
        "investment",
        "other",
      ],
      labor_model: [
        "hourly",
        "per_service",
        "commission_percent",
        "monthly_cost",
        "daily_cost",
      ],
      member_role: ["owner", "admin", "professional", "staff"],
      movement_type: ["in", "out", "adjustment"],
      payment_method: [
        "cash",
        "bank_transfer",
        "pix",
        "credit_card",
        "debit_card",
        "boleto",
        "check",
        "debit_note",
        "other",
      ],
      periodicity: ["monthly", "weekly", "yearly", "daily", "custom"],
      price_component_kind: ["labor", "material", "additional"],
      quote_status: ["draft", "sent", "accepted", "rejected", "expired"],
      transaction_doc_type: [
        "manual",
        "nfe",
        "nfce",
        "boleto",
        "receipt",
        "card_batch",
        "other",
      ],
      transaction_status: ["pending", "partial", "paid", "cancelled"],
      transaction_type: ["payable", "receivable"],
      unit_measure: [
        "unit",
        "ml",
        "liter",
        "kg",
        "gram",
        "meter",
        "box",
        "pack",
        "hour",
        "other",
      ],
    },
  },
} as const
