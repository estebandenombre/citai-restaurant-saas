import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          cover_image_url: string | null
          cuisine_type: string | null
          opening_hours: any | null
          social_media: any | null
          theme_colors: any | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          cuisine_type?: string | null
          opening_hours?: any | null
          social_media?: any | null
          theme_colors?: any | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          cuisine_type?: string | null
          opening_hours?: any | null
          social_media?: any | null
          theme_colors?: any | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          allergens: string[] | null
          dietary_info: string[] | null
          ingredients: string[] | null
          preparation_time: number | null
          is_available: boolean
          is_featured: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          order_number: string
          customer_name: string | null
          customer_phone: string | null
          customer_email: string | null
          table_number: number | null
          order_type: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      customers: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          email: string | null
          phone: string | null
          status: string
          total_orders: number
          total_spent: number
          average_order_value: number
          first_order_date: string | null
          last_order_date: string | null
          favorite_items: string[] | null
          tags: string[] | null
          notes: string | null
          marketing_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          email?: string | null
          phone?: string | null
          status?: string
          total_orders?: number
          total_spent?: number
          average_order_value?: number
          first_order_date?: string | null
          last_order_date?: string | null
          favorite_items?: string[] | null
          tags?: string[] | null
          notes?: string | null
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          status?: string
          total_orders?: number
          total_spent?: number
          average_order_value?: number
          first_order_date?: string | null
          last_order_date?: string | null
          favorite_items?: string[] | null
          tags?: string[] | null
          notes?: string | null
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      email_campaigns: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          subject: string
          content: string
          target_audience: string
          status: string
          scheduled_at: string | null
          sent_at: string | null
          recipients_count: number
          delivered_count: number
          opened_count: number
          clicked_count: number
          bounce_count: number
          open_rate: number | null
          click_rate: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          subject: string
          content: string
          target_audience: string
          status?: string
          scheduled_at?: string | null
          sent_at?: string | null
          recipients_count?: number
          delivered_count?: number
          opened_count?: number
          clicked_count?: number
          bounce_count?: number
          open_rate?: number | null
          click_rate?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          subject?: string
          content?: string
          target_audience?: string
          status?: string
          scheduled_at?: string | null
          sent_at?: string | null
          recipients_count?: number
          delivered_count?: number
          opened_count?: number
          clicked_count?: number
          bounce_count?: number
          open_rate?: number | null
          click_rate?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_segments: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          criteria: any
          customer_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          criteria: any
          customer_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          criteria?: any
          customer_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customer_interactions: {
        Row: {
          id: string
          customer_id: string
          restaurant_id: string
          interaction_type: string
          interaction_data: any | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          restaurant_id: string
          interaction_type: string
          interaction_data?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          restaurant_id?: string
          interaction_type?: string
          interaction_data?: any | null
          created_at?: string
        }
      }
      customer_preferences: {
        Row: {
          id: string
          customer_id: string
          preference_type: string
          preference_value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          preference_type: string
          preference_value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          preference_type?: string
          preference_value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
