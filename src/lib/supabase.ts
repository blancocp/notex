import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente normal para auth habilitado
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente administrativo para cuando auth está deshabilitado
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ID de usuario por defecto cuando no hay autenticación
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

// Cliente que se usa según el modo de autenticación
export const getSupabaseClient = () => {
  if (process.env.DISABLE_AUTH === 'true') {
    return supabaseAdmin
  }
  return supabase
}

// Helper para obtener el user_id correcto
export const getCurrentUserId = async () => {
  if (process.env.DISABLE_AUTH === 'true') {
    return DEFAULT_USER_ID
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string | null
          description: string | null
          category_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          description?: string | null
          category_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          description?: string | null
          category_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          note_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          note_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      note_urls: {
        Row: {
          id: string
          note_id: string
          url: string
          title: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          url: string
          title?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          url?: string
          title?: string | null
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}
