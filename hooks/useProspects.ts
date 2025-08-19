import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../components/AuthContext'
import { 
  getProspects, 
  createProspect, 
  updateProspect as updateProspectApi, 
  deleteProspect,
  createEngagementEvent,
  type EnhancedProspect,
  type ProspectInsert,
  type ProspectUpdate,
  type EngagementEventInsert
} from '../utils/supabase/api'
import type { EngagementGroup, ProspectStatus } from '../types'

// Demo prospects data for consistent demo experience
const DEMO_PROSPECTS: EnhancedProspect[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    name: 'Sarah Chen',
    email: 'sarah.chen@techstartup.com',
    company: 'TechStartup Inc',
    title: 'Marketing Director',
    phone: '+1-555-0123',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    website: 'https://techstartup.com',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    status: 'interested' as ProspectStatus,
    engagement_group: 4 as EngagementGroup,
    opens: 5,
    clicks: 2,
    replies: 1,
    current_stage: 2,
    last_contacted_at: '2024-01-18T09:15:00Z',
    next_contact_at: '2024-01-22T10:00:00Z',
    notes: 'Very interested in our solution. Mentioned budget approval needed.',
    tags: ['decision-maker', 'high-value', 'warm'],
    custom_data: {}
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-19T11:45:00Z',
    name: 'Michael Rodriguez',
    email: 'michael@innovatecorp.com',
    company: 'InnovateCorp',
    title: 'VP of Sales',
    phone: '+1-555-0124',
    linkedin_url: 'https://linkedin.com/in/michaelrodriguez',
    website: 'https://innovatecorp.com',
    city: 'Austin',
    state: 'TX',
    country: 'US',
    status: 'replied' as ProspectStatus,
    engagement_group: 3 as EngagementGroup,
    opens: 3,
    clicks: 1,
    replies: 1,
    current_stage: 1,
    last_contacted_at: '2024-01-17T14:20:00Z',
    next_contact_at: '2024-01-21T15:00:00Z',
    notes: 'Responded positively to initial outreach. Wants to schedule a demo.',
    tags: ['interested', 'demo-scheduled'],
    custom_data: {}
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-19T16:30:00Z',
    name: 'Emily Johnson',
    email: 'emily.johnson@globaltech.com',
    company: 'GlobalTech Solutions',
    title: 'Chief Technology Officer',
    phone: '+1-555-0125',
    linkedin_url: 'https://linkedin.com/in/emilyjohnson',
    website: 'https://globaltech.com',
    city: 'New York',
    state: 'NY', 
    country: 'US',
    status: 'qualified' as ProspectStatus,
    engagement_group: 5 as EngagementGroup,
    opens: 8,
    clicks: 4,
    replies: 2,
    current_stage: 3,
    last_contacted_at: '2024-01-19T10:30:00Z',
    next_contact_at: '2024-01-23T11:00:00Z',
    notes: 'Ready to move forward. Discussing pricing and implementation timeline.',
    tags: ['qualified', 'enterprise', 'hot'],
    custom_data: {}
  },
  {
    id: 'demo-4',
    user_id: 'demo-user',
    created_at: '2024-01-12T13:45:00Z',
    updated_at: '2024-01-18T12:15:00Z',
    name: 'David Kim',
    email: 'david@startupventure.com',
    company: 'StartupVenture',
    title: 'Founder & CEO',
    phone: '+1-555-0126',
    linkedin_url: 'https://linkedin.com/in/davidkim',
    website: 'https://startupventure.com',
    city: 'Seattle',
    state: 'WA',
    country: 'US',
    status: 'contacted' as ProspectStatus,
    engagement_group: 2 as EngagementGroup,
    opens: 2,
    clicks: 0,
    replies: 0,
    current_stage: 1,
    last_contacted_at: '2024-01-16T08:45:00Z',
    next_contact_at: '2024-01-20T09:00:00Z',
    notes: 'Initial email sent. No response yet. Will follow up in a few days.',
    tags: ['founder', 'startup'],
    custom_data: {}
  },
  {
    id: 'demo-5',
    user_id: 'demo-user',
    created_at: '2024-01-11T11:20:00Z',
    updated_at: '2024-01-17T14:50:00Z',
    name: 'Lisa Wang',
    email: 'lisa.wang@enterprisecorp.com',
    company: 'EnterpriseCorp',
    title: 'Head of Operations',
    phone: '+1-555-0127',
    linkedin_url: 'https://linkedin.com/in/lisawang',
    website: 'https://enterprisecorp.com',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    status: 'cold' as ProspectStatus,
    engagement_group: 0 as EngagementGroup,
    opens: 0,
    clicks: 0,
    replies: 0,
    current_stage: 0,
    last_contacted_at: null,
    next_contact_at: '2024-01-21T10:00:00Z',
    notes: 'Added to prospect list. Ready for initial outreach.',
    tags: ['enterprise', 'operations'],
    custom_data: {}
  },
  {
    id: 'demo-6',
    user_id: 'demo-user',
    created_at: '2024-01-10T16:10:00Z',
    updated_at: '2024-01-18T09:25:00Z',
    name: 'James Thompson',
    email: 'james@techconsulting.com',
    company: 'TechConsulting Pro',
    title: 'Senior Consultant',
    phone: '+1-555-0128',
    linkedin_url: 'https://linkedin.com/in/jamesthompson',
    website: 'https://techconsulting.com',
    city: 'Denver',
    state: 'CO',
    country: 'US',
    status: 'handoff' as ProspectStatus,
    engagement_group: 6 as EngagementGroup,
    opens: 12,
    clicks: 6,
    replies: 3,
    current_stage: 4,
    last_contacted_at: '2024-01-18T09:25:00Z',
    next_contact_at: null,
    notes: 'Ready for sales handoff. All qualification criteria met. Very engaged prospect.',
    tags: ['qualified', 'sales-ready', 'consultant'],
    custom_data: {}
  }
]

export function useProspects() {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()

  // Use demo data when in demo mode or when user is not authenticated
  const shouldUseDemoData = isDemo || !user

  return useQuery({
    queryKey: ['prospects', user?.id, isDemo],
    queryFn: async (): Promise<EnhancedProspect[]> => {
      if (shouldUseDemoData) {
        // Return demo data with a slight delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))
        return DEMO_PROSPECTS
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      return await getProspects(user.id)
    },
    enabled: true, // Always enabled since we have demo fallback
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateProspect() {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (prospectData: ProspectInsert): Promise<EnhancedProspect> => {
      if (isDemo) {
        // Simulate creation in demo mode
        const newProspect: EnhancedProspect = {
          id: `demo-new-${Date.now()}`,
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'cold' as ProspectStatus,
          engagement_group: 0 as EngagementGroup,
          opens: 0,
          clicks: 0,
          replies: 0,
          current_stage: 0,
          last_contacted_at: null,
          next_contact_at: null,
          tags: [],
          custom_data: {},
          ...prospectData,
        }
        return newProspect
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      return await createProspect({ ...prospectData, user_id: user.id })
    },
    onSuccess: () => {
      // Invalidate and refetch prospects
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
    onError: (error) => {
      console.error('Failed to create prospect:', error)
    },
  })
}

export function useUpdateProspect() {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProspectUpdate }): Promise<EnhancedProspect> => {
      if (isDemo) {
        // Simulate update in demo mode
        const currentProspects = queryClient.getQueryData(['prospects', user?.id, isDemo]) as EnhancedProspect[]
        const prospect = currentProspects?.find(p => p.id === id)
        if (!prospect) throw new Error('Prospect not found')
        
        return {
          ...prospect,
          ...updates,
          updated_at: new Date().toISOString(),
        }
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      return await updateProspectApi(id, updates)
    },
    onSuccess: () => {
      // Invalidate and refetch prospects
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
    onError: (error) => {
      console.error('Failed to update prospect:', error)
    },
  })
}

export function useDeleteProspect() {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (isDemo) {
        // Simulate deletion in demo mode
        return Promise.resolve()
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      await deleteProspect(id)
    },
    onSuccess: () => {
      // Invalidate and refetch prospects
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
    onError: (error) => {
      console.error('Failed to delete prospect:', error)
    },
  })
}

// Hook for engagement events
export function useAddEngagementEvent() {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ prospectId, type, description, metadata = {} }: {
      prospectId: string
      type: string
      description: string
      metadata?: any
    }) => {
      if (isDemo) {
        // Simulate engagement event creation in demo mode
        await new Promise(resolve => setTimeout(resolve, 200))
        return Promise.resolve()
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const eventData: EngagementEventInsert = {
        prospect_id: prospectId,
        user_id: user.id,
        type: type as any, // Type assertion for the enum
        description,
        metadata: metadata || {}
      }

      return await createEngagementEvent(eventData)
    },
    onSuccess: () => {
      // Invalidate and refetch prospects to get updated engagement data
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      queryClient.invalidateQueries({ queryKey: ['engagement-events'] })
    },
    onError: (error) => {
      console.error('Failed to add engagement event:', error)
    },
  })
}

// Hook for bulk operations
export function useBulkProspectOperations() {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()

  const bulkCreate = useMutation({
    mutationFn: async (prospects: ProspectInsert[]): Promise<EnhancedProspect[]> => {
      if (isDemo) {
        // Simulate bulk creation in demo mode
        return prospects.map((prospect, index) => ({
          id: `demo-bulk-${Date.now()}-${index}`,
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'cold' as ProspectStatus,
          engagement_group: 0 as EngagementGroup,
          opens: 0,
          clicks: 0,
          replies: 0,
          current_stage: 0,
          last_contacted_at: null,
          next_contact_at: null,
          tags: [],
          custom_data: {},
          ...prospect,
        }))
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // In real implementation, this would be a batch create API call
      const results = await Promise.all(
        prospects.map(prospect => createProspect({ ...prospect, user_id: user.id }))
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
  })

  const bulkUpdate = useMutation({
    mutationFn: async (updates: { id: string; updates: ProspectUpdate }[]): Promise<void> => {
      if (isDemo) {
        // Simulate bulk update in demo mode
        return Promise.resolve()
      }

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // In real implementation, this would be a batch update API call
      await Promise.all(
        updates.map(({ id, updates }) => updateProspectApi(id, updates))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
  })

  return {
    bulkCreate,
    bulkUpdate,
  }
}

// Create an alias for backwards compatibility
export const useBulkCreateProspects = () => {
  const { bulkCreate } = useBulkProspectOperations()
  return bulkCreate
}

// Export demo data for other components that might need it
export { DEMO_PROSPECTS }