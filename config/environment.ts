// Environment configuration with proper client/server-side handling
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const

const optionalEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_VERSION',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'NODE_ENV',
  'ENVIRONMENT',
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_ENABLE_DEBUGGING',
  'NEXT_PUBLIC_ENABLE_REALTIME'
] as const

type RequiredEnvVar = typeof requiredEnvVars[number]
type OptionalEnvVar = typeof optionalEnvVars[number]
type EnvVar = RequiredEnvVar | OptionalEnvVar

// Check if we're running on the client side
const isClientSide = () => typeof window !== 'undefined'
const isServerSide = () => typeof window === 'undefined'

// Get environment variable with proper client/server handling
function getEnvVar(name: EnvVar): string | undefined {
  // On the server side, we can access process.env directly
  if (isServerSide()) {
    return process?.env?.[name]
  }
  
  // On the client side, only NEXT_PUBLIC_ variables are available
  // and they're injected at build time into globalThis
  if (isClientSide()) {
    // Try to get from injected environment
    const injectedEnv = (globalThis as any).__NEXT_DATA__?.env
    if (injectedEnv && injectedEnv[name]) {
      return injectedEnv[name]
    }
    
    // For NEXT_PUBLIC_ variables, try direct access if available
    if (name.startsWith('NEXT_PUBLIC_')) {
      try {
        // These should be available at build time
        return (process?.env as any)?.[name] || undefined
      } catch {
        // If process is not available, return undefined
        return undefined
      }
    }
    
    // For non-public variables on client side, return undefined
    return undefined
  }
  
  return undefined
}

// Safe environment variable access with fallbacks
const getEnvVarSafe = (name: EnvVar, fallback?: string): string => {
  try {
    return getEnvVar(name) || fallback || ''
  } catch {
    return fallback || ''
  }
}

function validateEnvironment() {
  const missing: RequiredEnvVar[] = []
  const warnings: string[] = []

  // Only validate on server side or if variables are available
  if (isServerSide()) {
    // Check required variables
    for (const varName of requiredEnvVars) {
      const value = getEnvVar(varName)
      if (!value || value.trim() === '') {
        missing.push(varName)
      }
    }

    // Validate URLs
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    if (supabaseUrl && !supabaseUrl.startsWith('https://') && !supabaseUrl.includes('localhost')) {
      warnings.push('NEXT_PUBLIC_SUPABASE_URL should use HTTPS in production')
    }
  }

  return { missing, warnings }
}

// Validate environment on module load (only on server side)
const validation = isServerSide() ? validateEnvironment() : { missing: [], warnings: [] }

// Log warnings in development (server side only)
if (isServerSide() && getEnvVarSafe('NODE_ENV', 'development') === 'development') {
  if (validation.missing.length > 0) {
    console.warn('⚠️  Missing required environment variables:', validation.missing.join(', '))
    console.warn('🔧 App will run in demo mode without database connectivity')
  }
  
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => console.warn('⚠️ ', warning))
  }
}

// Export environment configuration with safe defaults
export const environment = {
  // Required Supabase config - these should be available on client side
  supabaseUrl: getEnvVarSafe('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvVarSafe('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  
  // App config - with fallbacks
  appUrl: getEnvVarSafe('NEXT_PUBLIC_APP_URL') || 
    (isClientSide() ? (window?.location?.origin || 'http://localhost:3000') : 'http://localhost:3000'),
  appName: getEnvVarSafe('NEXT_PUBLIC_APP_NAME', 'Toastify'),
  appVersion: getEnvVarSafe('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  
  // Server-side config (only available on server)
  supabaseServiceRoleKey: getEnvVarSafe('SUPABASE_SERVICE_ROLE_KEY'),
  databaseUrl: getEnvVarSafe('DATABASE_URL'),
  
  // Environment detection
  nodeEnv: getEnvVarSafe('NODE_ENV', 'development'),
  environment: getEnvVarSafe('ENVIRONMENT', 'development'),
  isProduction: getEnvVarSafe('NODE_ENV', 'development') === 'production',
  isDevelopment: getEnvVarSafe('NODE_ENV', 'development') === 'development',
  isTest: getEnvVarSafe('NODE_ENV', 'development') === 'test',
  
  // Feature flags with safe defaults
  enableAnalytics: getEnvVarSafe('NEXT_PUBLIC_ENABLE_ANALYTICS') === 'true',
  enableDebugging: getEnvVarSafe('NEXT_PUBLIC_ENABLE_DEBUGGING') === 'true' || 
    getEnvVarSafe('NODE_ENV', 'development') === 'development',
  enableRealtime: getEnvVarSafe('NEXT_PUBLIC_ENABLE_REALTIME', 'true') !== 'false', // default to true
  
  // Runtime information
  isClientSide: isClientSide(),
  isServerSide: isServerSide(),
  
  // Validation results (only meaningful on server side)
  isValid: validation.missing.length === 0,
  missingVars: validation.missing,
  warnings: validation.warnings,
} as const

// Helper functions
export const isSupabaseConfigured = (): boolean => {
  return !!(environment.supabaseUrl && 
            environment.supabaseAnonKey && 
            environment.supabaseUrl.trim() !== '' && 
            environment.supabaseAnonKey.trim() !== '')
}

export const isDemoMode = (): boolean => {
  return !isSupabaseConfigured()
}

export const getAppUrl = (): string => {
  return environment.appUrl
}

export { isClientSide, isServerSide }

// Development helpers (only on client side to avoid server-side logging)
if (environment.enableDebugging && isClientSide()) {
  // Add to window for debugging
  ;(window as any).__env__ = environment
  
  console.log('🔧 Environment config (client):', {
    isSupabaseConfigured: isSupabaseConfigured(),
    isDemoMode: isDemoMode(),
    environment: environment.environment,
    hasSupabaseUrl: !!environment.supabaseUrl,
    hasSupabaseKey: !!environment.supabaseAnonKey,
    enabledFeatures: {
      analytics: environment.enableAnalytics,
      debugging: environment.enableDebugging,
      realtime: environment.enableRealtime,
    },
  })
}

export default environment