import { createClient } from '@supabase/supabase-js'
import { environment, isSupabaseConfigured, isDemoMode, isClientSide, isServerSide } from '../config/environment'
import type { Database } from '../utils/supabase/database.types'

// Only create Supabase client if properly configured
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Initialize Supabase client safely
function initializeSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  if (!isSupabaseConfigured()) {
    // Log info about demo mode only once and only in development
    if (environment.isDevelopment && isServerSide()) {
      console.info('ℹ️  Supabase not configured - running in demo mode')
      console.info('   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable database connectivity')
    }
    return null
  }

  try {
    supabaseInstance = createClient<Database>(
      environment.supabaseUrl, 
      environment.supabaseAnonKey, 
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: isClientSide() ? window.localStorage : undefined,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
        global: {
          headers: {
            'X-Client-Info': 'toastify-web-app',
          },
        },
      }
    )
    
    return supabaseInstance
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return null
  }
}

// Export the Supabase client instance (lazy initialization)
export const supabase = initializeSupabaseClient()

// Conditional exports based on client availability
export const auth = supabase?.auth || null
export const db = supabase?.from || null
export const storage = supabase?.storage || null
export const realtime = supabase?.realtime || null

// Export types for convenience
export type { Database } from '../utils/supabase/database.types'
export type User = Database['public']['Tables']['profiles']['Row']

// Client status helpers
export const isClientConfigured = (): boolean => !!supabase && isSupabaseConfigured()

export const getClientStatus = () => ({
  configured: isClientConfigured(),
  demoMode: isDemoMode(),
  hasAuth: !!auth,
  hasDatabase: !!db,
  hasStorage: !!storage,
  hasRealtime: !!realtime,
  environment: {
    isClientSide: isClientSide(),
    isServerSide: isServerSide(),
    hasUrl: !!environment.supabaseUrl,
    hasKey: !!environment.supabaseAnonKey,
  }
})

// Safe client wrapper functions
export async function safeAuthCall<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!auth) {
    if (environment.enableDebugging) {
      console.warn('Authentication not available - operation skipped')
    }
    return fallback
  }
  
  try {
    return await operation()
  } catch (error) {
    console.error('Auth operation failed:', error)
    return fallback
  }
}

export async function safeDbCall<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!db) {
    if (environment.enableDebugging) {
      console.warn('Database not available - operation skipped')
    }
    return fallback
  }
  
  try {
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    return fallback
  }
}

// Development helper (client-side only)
if (environment.enableDebugging && isClientSide()) {
  ;(window as any).__supabase__ = {
    client: supabase,
    status: getClientStatus(),
    configured: isClientConfigured(),
    demoMode: isDemoMode(),
    environment: environment,
  }
  
  console.log('🔧 Supabase client status:', getClientStatus())
}

export default supabase