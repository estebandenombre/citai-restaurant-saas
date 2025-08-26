export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string
          created_at: string
          updated_at: string
          // Configuración de impresión
          printer_config?: {
            enabled: boolean
            printer_type: 'thermal' | 'pdf' | 'escpos' | 'network'
            printer_ip?: string
            printer_port?: number
            printer_name?: string
            paper_width?: number // mm
            auto_cut?: boolean
            print_logo?: boolean
            header_text?: string
            footer_text?: string
          }
        }
        Insert: {
          id?: string
          name: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string
          created_at?: string
          updated_at?: string
          printer_config?: {
            enabled: boolean
            printer_type: 'thermal' | 'pdf' | 'escpos' | 'network'
            printer_ip?: string
            printer_port?: number
            printer_name?: string
            paper_width?: number
            auto_cut?: boolean
            print_logo?: boolean
            header_text?: string
            footer_text?: string
          }
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string
          created_at?: string
          updated_at?: string
          printer_config?: {
            enabled: boolean
            printer_type: 'thermal' | 'pdf' | 'escpos' | 'network'
            printer_ip?: string
            printer_port?: number
            printer_name?: string
            paper_width?: number
            auto_cut?: boolean
            print_logo?: boolean
            header_text?: string
            footer_text?: string
          }
        }
      }
    }
  }
} 