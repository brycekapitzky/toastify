import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { environment, isSupabaseConfigured } from '../../config/environment'

// Only create the client if we have valid configuration
export const supabase = isSupabaseConfigured()
  ? createClient<Database>(environment.supabaseUrl, environment.supabaseAnonKey)
  : null

// Types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Prospect = Database['public']['Tables']['prospects']['Row']
export type EngagementEvent = Database['public']['Tables']['engagement_events']['Row']
export type EmailStage = Database['public']['Tables']['email_stages']['Row']
export type Inbox = Database['public']['Tables']['inboxes']['Row']
export type Sequence = Database['public']['Tables']['sequences']['Row']

export type ProspectInsert = Database['public']['Tables']['prospects']['Insert']
export type ProspectUpdate = Database['public']['Tables']['prospects']['Update']
export type EngagementEventInsert = Database['public']['Tables']['engagement_events']['Insert']

// Enhanced Prospect type with computed fields for compatibility
export interface EnhancedProspect extends Prospect {
  group: number // Maps to engagement_group
  lastEngagement?: string
  engagementEvents?: EngagementEvent[]
}

// Error types
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Utility function to handle Supabase errors
function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error)
  throw new DatabaseError(error.message || 'Database operation failed', error.code)
}

// Re-export the configuration check
export { isSupabaseConfigured }

// Guard function to ensure supabase client exists
function requireSupabase() {
  if (!supabase) {
    throw new DatabaseError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  return supabase
}

// API Functions

// Profile Functions
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      handleSupabaseError(error)
    }
    
    return data || null
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function completeOnboarding(userId: string, onboardingData: any): Promise<Profile> {
  try {
    const updates = {
      onboarding_completed: true,
      onboarding_data: onboardingData,
      company_domain: onboardingData.companyDomain,
      updated_at: new Date().toISOString()
    }
    
    return await updateProfile(userId, updates)
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

// Prospect Functions
export async function getProspects(userId: string): Promise<EnhancedProspect[]> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('prospects')
      .select(`
        *,
        engagement_events (
          id,
          type,
          description,
          created_at,
          metadata
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) handleSupabaseError(error)
    
    // Transform prospects to match existing interface
    return (data || []).map(prospect => ({
      ...prospect,
      group: prospect.engagement_group, // Map engagement_group to group for compatibility
      lastEngagement: prospect.engagement_events?.[0]?.created_at,
      engagementEvents: prospect.engagement_events || []
    })) as EnhancedProspect[]
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function createProspect(prospectData: ProspectInsert): Promise<EnhancedProspect> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('prospects')
      .insert({
        ...prospectData,
        engagement_group: prospectData.engagement_group || 0
      })
      .select(`
        *,
        engagement_events (
          id,
          type,
          description,
          created_at,
          metadata
        )
      `)
      .single()
    
    if (error) handleSupabaseError(error)
    
    return {
      ...data,
      group: data.engagement_group,
      lastEngagement: data.engagement_events?.[0]?.created_at,
      engagementEvents: data.engagement_events || []
    } as EnhancedProspect
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function updateProspect(prospectId: string, updates: ProspectUpdate): Promise<EnhancedProspect> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('prospects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', prospectId)
      .select(`
        *,
        engagement_events (
          id,
          type,
          description,
          created_at,
          metadata
        )
      `)
      .single()
    
    if (error) handleSupabaseError(error)
    
    return {
      ...data,
      group: data.engagement_group,
      lastEngagement: data.engagement_events?.[0]?.created_at,
      engagementEvents: data.engagement_events || []
    } as EnhancedProspect
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function deleteProspect(prospectId: string): Promise<void> {
  try {
    const client = requireSupabase()
    const { error } = await client
      .from('prospects')
      .delete()
      .eq('id', prospectId)
    
    if (error) handleSupabaseError(error)
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function bulkCreateProspects(userId: string, prospects: Omit<ProspectInsert, 'user_id'>[]): Promise<EnhancedProspect[]> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('prospects')
      .insert(
        prospects.map(prospect => ({
          ...prospect,
          user_id: userId,
          engagement_group: prospect.engagement_group || 0
        }))
      )
      .select(`
        *,
        engagement_events (
          id,
          type,
          description,
          created_at,
          metadata
        )
      `)
    
    if (error) handleSupabaseError(error)
    
    return (data || []).map(prospect => ({
      ...prospect,
      group: prospect.engagement_group,
      lastEngagement: prospect.engagement_events?.[0]?.created_at,
      engagementEvents: prospect.engagement_events || []
    })) as EnhancedProspect[]
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

// Engagement Event Functions
export async function createEngagementEvent(eventData: EngagementEventInsert): Promise<EngagementEvent> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('engagement_events')
      .insert(eventData)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    
    // Update prospect engagement counters based on event type
    await updateProspectEngagementCounters(eventData.prospect_id, eventData.type)
    
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

// Legacy function name for backwards compatibility
export async function addEngagementEvent(
  userId: string,
  prospectId: string,
  eventData: Omit<EngagementEventInsert, 'user_id' | 'prospect_id'>
): Promise<EngagementEvent> {
  return createEngagementEvent({
    ...eventData,
    user_id: userId,
    prospect_id: prospectId
  })
}

async function updateProspectEngagementCounters(prospectId: string, eventType: string) {
  try {
    const client = requireSupabase()
    // Get current prospect data
    const { data: prospect, error: fetchError } = await client
      .from('prospects')
      .select('opens, clicks, replies, engagement_group')
      .eq('id', prospectId)
      .single()
    
    if (fetchError) return // Silently fail to not block main operation
    
    let updates: Partial<ProspectUpdate> = {}
    
    switch (eventType) {
      case 'email_opened':
        updates.opens = (prospect.opens || 0) + 1
        break
      case 'email_clicked':
        updates.clicks = (prospect.clicks || 0) + 1
        break
      case 'email_replied':
        updates.replies = (prospect.replies || 0) + 1
        break
    }
    
    // Calculate new engagement group based on total engagement
    const totalEngagement = (updates.opens || prospect.opens || 0) + 
                           (updates.clicks || prospect.clicks || 0) + 
                           (updates.replies || prospect.replies || 0)
    
    // Update engagement group based on scoring system
    if (totalEngagement === 0) updates.engagement_group = 0 // Cold
    else if (totalEngagement <= 2) updates.engagement_group = 1 // Warming
    else if (totalEngagement <= 4) updates.engagement_group = 2 // Warming
    else if (totalEngagement <= 5) updates.engagement_group = 3 // Interested  
    else if (totalEngagement <= 6) updates.engagement_group = 4 // Hot Lead
    else updates.engagement_group = 5 // Hand-off
    
    if (Object.keys(updates).length > 0) {
      await client
        .from('prospects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId)
    }
  } catch (error) {
    console.error('Failed to update engagement counters:', error)
    // Don't throw - this is a secondary operation
  }
}

// Email Stage Functions
export async function getEmailStages(userId: string): Promise<EmailStage[]> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('email_stages')
      .select('*')
      .eq('user_id', userId)
      .order('sequence', { ascending: true })
    
    if (error) handleSupabaseError(error)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function createEmailStages(userId: string, stages: Omit<EmailStage, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<EmailStage[]> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('email_stages')
      .insert(
        stages.map(stage => ({
          ...stage,
          user_id: userId
        }))
      )
      .select()
    
    if (error) handleSupabaseError(error)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

// Inbox Functions
export async function getInboxes(userId: string): Promise<Inbox[]> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('inboxes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) handleSupabaseError(error)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

export async function createInbox(userId: string, inboxData: Omit<Inbox, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Inbox> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('inboxes')
      .insert({
        ...inboxData,
        user_id: userId
      })
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

// Sequence Functions  
export async function getSequences(userId: string): Promise<Sequence[]> {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('sequences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) handleSupabaseError(error)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    handleSupabaseError(error)
  }
}

// Real-time subscriptions (only work when Supabase is configured)
export function subscribeToProspects(userId: string, callback: (prospects: EnhancedProspect[]) => void) {
  const client = requireSupabase()
  return client
    .channel('prospects-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'prospects',
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Refetch prospects when changes occur
        getProspects(userId).then(callback).catch(console.error)
      }
    )
    .subscribe()
}

export function subscribeToEngagementEvents(userId: string, callback: (events: EngagementEvent[]) => void) {
  const client = requireSupabase()
  return client
    .channel('engagement-events-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'engagement_events',
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Refetch engagement events when changes occur
        client
          .from('engagement_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .then(({ data }) => callback(data || []))
          .catch(console.error)
      }
    )
    .subscribe()
}