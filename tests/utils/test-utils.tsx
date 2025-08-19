import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../components/AuthContext'

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockProspect = (overrides = {}) => ({
  id: 'test-prospect-1',
  user_id: 'test-user',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Test Company',
  title: 'CEO',
  phone: '+1234567890',
  linkedin_url: 'https://linkedin.com/in/john',
  website: 'https://testcompany.com',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  status: 'cold' as const,
  engagement_group: 0,
  group: 0,
  opens: 0,
  clicks: 0,
  replies: 0,
  current_stage: 0,
  last_contacted_at: null,
  next_contact_at: null,
  notes: null,
  tags: [],
  custom_data: {},
  engagementEvents: [],
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  confirmed_at: '2024-01-01T00:00:00Z',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
    avatar_url: null,
  },
  aud: 'authenticated',
  role: 'authenticated',
  ...overrides,
})

// Mock handlers
export const mockSupabaseAuth = () => {
  const mockAuth = {
    getUser: () => Promise.resolve({ data: { user: createMockUser() }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: createMockUser() }, error: null }),
    signUp: () => Promise.resolve({ data: { user: createMockUser() }, error: null }),
    signInWithOAuth: () => Promise.resolve({ data: { user: createMockUser() }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }

  return mockAuth
}

// Wait utilities
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Form helpers
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react')
  
  Object.entries(data).forEach(([name, value]) => {
    const field = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (field) {
      fireEvent.change(field, { target: { value } })
    }
  })
}

// API mocking utilities
export const mockAPIResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

export const mockAPIError = (message: string, status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: { message } }),
  text: () => Promise.resolve(JSON.stringify({ error: { message } })),
})