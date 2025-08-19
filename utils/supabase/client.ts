import { createClient } from '@supabase/supabase-js'

// Simple environment variable access with fallbacks
const getEnvVar = (name: string, fallback: string): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check for injected environment variables (common in some setups)
    const windowEnv = (window as any).env
    if (windowEnv && windowEnv[name]) {
      return windowEnv[name]
    }
  }

  // Check for Vite environment variables (import.meta.env)
  if (typeof globalThis !== 'undefined' && (globalThis as any).process === undefined) {
    try {
      // Use dynamic import.meta access safely
      const meta = (globalThis as any).import?.meta
      if (meta && meta.env && meta.env[name]) {
        return meta.env[name]
      }
    } catch (e) {
      // Ignore errors accessing import.meta
    }
  }

  // Check for Create React App environment variables
  if (typeof globalThis !== 'undefined' && (globalThis as any).process) {
    const processEnv = (globalThis as any).process.env
    if (processEnv && processEnv[name]) {
      return processEnv[name]
    }
  }

  return fallback
}

// Get Supabase configuration
const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL', '') || 
                   getEnvVar('VITE_SUPABASE_URL', '') ||
                   'https://your-project.supabase.co'

const supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', '') ||
                       getEnvVar('VITE_SUPABASE_ANON_KEY', '') ||
                       'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      prospects: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          company: string
          title: string | null
          phone: string | null
          linkedin: string | null
          website: string | null
          score: number
          group: number
          opens: number
          clicks: number
          replies: number
          status: 'active' | 'paused' | 'bounced' | 'handoff' | 'cold'
          last_engagement: string | null
          next_send: string | null
          timezone: string
          tags: string[] | null
          notes: string | null
          timeline: any[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          company: string
          title?: string | null
          phone?: string | null
          linkedin?: string | null
          website?: string | null
          score?: number
          group?: number
          opens?: number
          clicks?: number
          replies?: number
          status?: 'active' | 'paused' | 'bounced' | 'handoff' | 'cold'
          last_engagement?: string | null
          next_send?: string | null
          timezone?: string
          tags?: string[] | null
          notes?: string | null
          timeline?: any[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          company?: string
          title?: string | null
          phone?: string | null
          linkedin?: string | null
          website?: string | null
          score?: number
          group?: number
          opens?: number
          clicks?: number
          replies?: number
          status?: 'active' | 'paused' | 'bounced' | 'handoff' | 'cold'
          last_engagement?: string | null
          next_send?: string | null
          timezone?: string
          tags?: string[] | null
          notes?: string | null
          timeline?: any[] | null
          created_at?: string
          updated_at?: string
        }
      }
      email_sequences: {
        Row: {
          id: string
          user_id: string
          name: string
          steps: any[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          steps: any[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          steps?: any[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          onboarding_completed: boolean
          company_domain: string | null
          sequence_status: 'active' | 'paused'
          stages_status: 'active' | 'paused'
          prospect_search_connected: boolean
          settings: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          onboarding_completed?: boolean
          company_domain?: string | null
          sequence_status?: 'active' | 'paused'
          stages_status?: 'active' | 'paused'
          prospect_search_connected?: boolean
          settings?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          onboarding_completed?: boolean
          company_domain?: string | null
          sequence_status?: 'active' | 'paused'
          stages_status?: 'active' | 'paused'
          prospect_search_connected?: boolean
          settings?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key-here' &&
         supabaseUrl.includes('supabase.co') &&
         supabaseUrl.startsWith('https://')
}

// Safe client that handles unconfigured state
export const safeSupabase = {
  ...supabase,
  isConfigured: isSupabaseConfigured(),
  
  // Override methods to handle unconfigured state gracefully
  from: (table: string) => {
    const originalFrom = supabase.from(table)
    
    return {
      ...originalFrom,
      select: async (...args: any[]) => {
        if (!isSupabaseConfigured()) {
          // Silent fallback - no warnings for demo mode
          return { data: [], error: null }
        }
        return originalFrom.select(...args)
      },
      insert: async (...args: any[]) => {
        if (!isSupabaseConfigured()) {
          // Silent fallback - no warnings for demo mode
          return { data: null, error: { message: 'Demo mode - operation simulated' } }
        }
        return originalFrom.insert(...args)
      },
      update: async (...args: any[]) => {
        if (!isSupabaseConfigured()) {
          // Silent fallback - no warnings for demo mode
          return { data: null, error: { message: 'Demo mode - operation simulated' } }
        }
        return originalFrom.update(...args)
      },
      delete: async (...args: any[]) => {
        if (!isSupabaseConfigured()) {
          // Silent fallback - no warnings for demo mode
          return { data: null, error: { message: 'Demo mode - operation simulated' } }
        }
        return originalFrom.delete(...args)
      },
      eq: (...args: any[]) => originalFrom.eq(...args),
      order: (...args: any[]) => originalFrom.order(...args),
      single: () => originalFrom.single()
    }
  },
  
  // Auth methods
  auth: {
    ...supabase.auth,
    getSession: async () => {
      if (!isSupabaseConfigured()) {
        return { data: { session: null }, error: null }
      }
      return supabase.auth.getSession()
    },
    onAuthStateChange: (...args: any[]) => {
      if (!isSupabaseConfigured()) {
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
      return supabase.auth.onAuthStateChange(...args)
    },
    signInWithPassword: async (...args: any[]) => {
      if (!isSupabaseConfigured()) {
        return { error: { message: 'Demo mode - authentication simulated' } }
      }
      return supabase.auth.signInWithPassword(...args)
    },
    signUp: async (...args: any[]) => {
      if (!isSupabaseConfigured()) {
        return { error: { message: 'Demo mode - registration simulated' } }
      }
      return supabase.auth.signUp(...args)
    },
    signInWithOAuth: async (...args: any[]) => {
      if (!isSupabaseConfigured()) {
        return { error: { message: 'Demo mode - OAuth simulated' } }
      }
      return supabase.auth.signInWithOAuth(...args)
    },
    signOut: async () => {
      if (!isSupabaseConfigured()) {
        return { error: null }
      }
      return supabase.auth.signOut()
    },
    resetPasswordForEmail: async (...args: any[]) => {
      if (!isSupabaseConfigured()) {
        return { error: { message: 'Demo mode - password reset simulated' } }
      }
      return supabase.auth.resetPasswordForEmail(...args)
    }
  }
}