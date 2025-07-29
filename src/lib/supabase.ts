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

export interface Order {
  id: string
  stripe_session_id: string
  customer_email: string
  customer_name?: string
  total_amount: number
  status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled' | 'failed'
  shipping_address?: any
  items: any[]
  printful_order_id?: string
  printful_order_status?: string
  tapstitch_order_id?: string
  tapstitch_order_status?: string
  created_at: string
  updated_at: string
}

// Database functions for orders
export async function createOrder(orderData: {
  stripe_session_id: string
  customer_email: string
  customer_name?: string
  total_amount: number
  shipping_address?: any
  items: any[]
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: orderData.stripe_session_id,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      total_amount: orderData.total_amount,
      status: 'paid',
      shipping_address: orderData.shipping_address,
      items: orderData.items
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    throw error
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: Order['status'], printfulOrderId?: string) {
  const updateData: any = { status }
  
  if (printfulOrderId) {
    updateData.printful_order_id = printfulOrderId
    updateData.printful_order_status = 'processing'
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    throw error
  }

  return data
}

export async function getOrderByStripeSessionId(stripeSessionId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', stripeSessionId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
} 