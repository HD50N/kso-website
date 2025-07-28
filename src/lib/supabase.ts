import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  username?: string
  graduation_year?: number
  major?: string
  user_type: 'undergrad' | 'grad' | 'alumni' | 'board_member'
  board_position?: string
  linkedin_url?: string
  instagram_url?: string
  bio?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  username?: string
  graduation_year?: number
  major?: string
  user_type: 'undergrad' | 'grad' | 'alumni' | 'board_member'
  board_position?: string
  linkedin_url?: string
  instagram_url?: string
  bio?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface BoardPosition {
  id: string
  role: string
  username?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
} 