export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductCategory =
  | 'aromatic'
  | 'new-year'
  | 'mono'
  | 'author'
  | 'edible'
  | 'wedding'
  | 'box'
  | 'gifts'
  | 'balloons'
  | 'vases'
  | 'certificates'
  | 'toys'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'delivering'
  | 'completed'
  | 'cancelled'

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          old_price: number | null
          image_url: string
          images: string[]
          category: ProductCategory
          article: string | null
          size: string | null
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          old_price?: number | null
          image_url: string
          images?: string[]
          category?: ProductCategory
          article?: string | null
          size?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          old_price?: number | null
          image_url?: string
          images?: string[]
          category?: ProductCategory
          article?: string | null
          size?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          delivery_address: string
          delivery_date: string
          delivery_time: string | null
          comment: string | null
          status: OrderStatus
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          delivery_address: string
          delivery_date: string
          delivery_time?: string | null
          comment?: string | null
          status?: OrderStatus
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          delivery_address?: string
          delivery_date?: string
          delivery_time?: string | null
          comment?: string | null
          status?: OrderStatus
          total_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          addons: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          addons?: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          addons?: Json
          created_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          image_url: string | null
          category: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          category?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          category?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          content: string | null
          image_url: string | null
          badge: string | null
          discount_percent: number | null
          is_active: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          content?: string | null
          image_url?: string | null
          badge?: string | null
          discount_percent?: number | null
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          content?: string | null
          image_url?: string | null
          badge?: string | null
          discount_percent?: number | null
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      product_category: ProductCategory
      order_status: OrderStatus
    }
  }
}
