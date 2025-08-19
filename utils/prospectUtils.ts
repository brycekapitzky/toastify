import type { EnhancedProspect, ProspectStatus, EngagementGroup } from '../types'

// Stage/Status label mappings
export const getStageLabel = (stage: number): string => {
  const labels: Record<number, string> = {
    0: 'Initial Contact',
    1: 'Follow-up 1',
    2: 'Follow-up 2', 
    3: 'Follow-up 3',
    4: 'Follow-up 4',
    5: 'Final Follow-up',
  }
  return labels[stage] || `Stage ${stage}`
}

export const getStatusLabel = (status: ProspectStatus): string => {
  const labels: Record<ProspectStatus, string> = {
    cold: 'Cold',
    contacted: 'Contacted',
    replied: 'Replied',
    interested: 'Interested',
    qualified: 'Qualified',
    handoff: 'Hand-off',
  }
  return labels[status] || status
}

export const getEngagementGroupLabel = (group: EngagementGroup): string => {
  const labels: Record<EngagementGroup, string> = {
    0: 'Cold',
    1: 'Warming',
    2: 'Warming',
    3: 'Interested',
    4: 'Interested', 
    5: 'Hot Lead',
    6: 'Hot Lead',
  }
  return labels[group] || 'Unknown'
}

// Color mappings for status and engagement
export const getStatusColor = (status: ProspectStatus): string => {
  const colors: Record<ProspectStatus, string> = {
    cold: 'bg-slate-100 text-slate-700 border-slate-200',
    contacted: 'bg-blue-100 text-blue-700 border-blue-200',
    replied: 'bg-green-100 text-green-700 border-green-200',
    interested: 'bg-amber-100 text-amber-700 border-amber-200',
    qualified: 'bg-purple-100 text-purple-700 border-purple-200',
    handoff: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export const getEngagementGroupColor = (group: EngagementGroup): string => {
  const colors: Record<EngagementGroup, string> = {
    0: 'bg-slate-100 text-slate-700 border-slate-200',
    1: 'bg-blue-100 text-blue-700 border-blue-200',
    2: 'bg-blue-200 text-blue-800 border-blue-300',
    3: 'bg-amber-100 text-amber-700 border-amber-200',
    4: 'bg-amber-200 text-amber-800 border-amber-300',
    5: 'bg-red-100 text-red-700 border-red-200',
    6: 'bg-red-200 text-red-800 border-red-300',
  }
  return colors[group] || 'bg-gray-100 text-gray-700 border-gray-200'
}

// Engagement score calculation
export const getEngagementScore = (prospect: EnhancedProspect): number => {
  if (!prospect) return 0
  
  // Calculate score based on engagement metrics
  let score = 0
  
  // Base score from engagement group
  score += prospect.engagement_group || 0
  
  // Bonus points for interactions
  score += Math.min(prospect.opens || 0, 5) * 0.1 // Max 0.5 points for opens
  score += Math.min(prospect.clicks || 0, 3) * 0.3 // Max 0.9 points for clicks  
  score += Math.min(prospect.replies || 0, 2) * 1.0 // Max 2.0 points for replies
  
  // Bonus for recent activity
  if (prospect.last_contacted_at) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(prospect.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceContact <= 7) {
      score += 0.5 // Recent activity bonus
    }
  }
  
  // Cap the score at 6
  return Math.min(Math.round(score * 10) / 10, 6)
}

// Status progression helpers
export const getNextStatus = (currentStatus: ProspectStatus): ProspectStatus | null => {
  const progression: Record<ProspectStatus, ProspectStatus | null> = {
    cold: 'contacted',
    contacted: 'replied', 
    replied: 'interested',
    interested: 'qualified',
    qualified: 'handoff',
    handoff: null,
  }
  return progression[currentStatus] || null
}

export const getPreviousStatus = (currentStatus: ProspectStatus): ProspectStatus | null => {
  const regression: Record<ProspectStatus, ProspectStatus | null> = {
    cold: null,
    contacted: 'cold',
    replied: 'contacted',
    interested: 'replied', 
    qualified: 'interested',
    handoff: 'qualified',
  }
  return regression[currentStatus] || null
}

// Engagement group helpers
export const updateEngagementGroup = (prospect: EnhancedProspect): EngagementGroup => {
  const score = getEngagementScore(prospect)
  
  if (score >= 5) return 6
  if (score >= 4) return 5
  if (score >= 3) return 4
  if (score >= 2) return 3
  if (score >= 1) return 2
  if (score > 0) return 1
  return 0
}

// Formatting helpers
export const formatProspectName = (prospect: EnhancedProspect): string => {
  return prospect.name || 'Unknown Contact'
}

export const formatCompanyInfo = (prospect: EnhancedProspect): string => {
  const parts = []
  if (prospect.title) parts.push(prospect.title)
  if (prospect.company) parts.push(prospect.company)
  return parts.join(' at ') || 'No company info'
}

export const formatLocation = (prospect: EnhancedProspect): string => {
  const parts = []
  if (prospect.city) parts.push(prospect.city)
  if (prospect.state) parts.push(prospect.state)
  if (prospect.country && prospect.country !== 'US') parts.push(prospect.country)
  return parts.join(', ') || ''
}

export const formatLastContact = (prospect: EnhancedProspect): string => {
  if (!prospect.last_contacted_at) return 'Never contacted'
  
  const date = new Date(prospect.last_contacted_at)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday' 
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export const formatNextContact = (prospect: EnhancedProspect): string => {
  if (!prospect.next_contact_at) return 'Not scheduled'
  
  const date = new Date(prospect.next_contact_at)
  const now = new Date()
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) return 'Overdue'
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Tomorrow'
  if (diffInDays < 7) return `In ${diffInDays} days`
  if (diffInDays < 30) return `In ${Math.floor(diffInDays / 7)} weeks`
  return `In ${Math.floor(diffInDays / 30)} months`
}

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true // LinkedIn URL is optional
  return url.includes('linkedin.com')
}

// Search and filter helpers
export const matchesSearchTerm = (prospect: EnhancedProspect, searchTerm: string): boolean => {
  if (!searchTerm) return true
  
  const term = searchTerm.toLowerCase()
  const searchableFields = [
    prospect.name?.toLowerCase(),
    prospect.email?.toLowerCase(), 
    prospect.company?.toLowerCase(),
    prospect.title?.toLowerCase(),
    prospect.notes?.toLowerCase(),
  ].filter(Boolean)
  
  return searchableFields.some(field => field?.includes(term))
}

export const sortProspects = (
  prospects: EnhancedProspect[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): EnhancedProspect[] => {
  return [...prospects].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '')
        break
      case 'email':
        comparison = (a.email || '').localeCompare(b.email || '')
        break
      case 'company':
        comparison = (a.company || '').localeCompare(b.company || '')
        break
      case 'engagement_group':
        comparison = (a.engagement_group || 0) - (b.engagement_group || 0)
        break
      case 'created_at':
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        break
      case 'updated_at':
        comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime()
        break
      case 'last_contacted_at':
        const aDate = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0
        const bDate = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0
        comparison = aDate - bDate
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

// Demo data helpers for consistent demo experience
export const isDemoProspect = (prospect: EnhancedProspect): boolean => {
  return prospect.id?.startsWith('demo-') || false
}

export const getDemoProspectCount = (prospects: EnhancedProspect[]): number => {
  return prospects.filter(isDemoProspect).length
}