// Re-export common types from Supabase for easier imports
export type { Database } from '../utils/supabase/database.types'

// Import and re-export API types
export type { 
  Profile, 
  Prospect, 
  EngagementEvent, 
  EmailStage, 
  Inbox, 
  Sequence,
  ProspectInsert,
  ProspectUpdate,
  EngagementEventInsert,
  EnhancedProspect 
} from '../utils/supabase/api'

// Utility types
export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'email'
  title: string
  message: string
  actionUrl?: string
  read?: boolean
  timestamp: string
}

export interface OnboardingData {
  companyDomain: string
  industry?: string
  teamSize?: string
  goals?: string[]
  completedAt: string
  [key: string]: any
}

// Component prop types
export interface DashboardProps {
  prospects?: EnhancedProspect[]
  isDemo?: boolean
  onNavigate?: (view: string) => void
}

// Engagement types
export type EngagementGroup = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type ProspectStatus = 'cold' | 'contacted' | 'replied' | 'interested' | 'qualified' | 'handoff'

// Chart data types for reports
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface EngagementChartData {
  date: string
  opens: number
  clicks: number
  replies: number
}

// Settings types
export interface UserSettings {
  emailSignature?: string
  timezone?: string
  notifications?: {
    email: boolean
    browser: boolean
    mobile: boolean
  }
  theme?: 'light' | 'dark' | 'system'
}

// Demo data structure for consistent typing
export interface DemoProspect {
  id: string
  name: string
  email: string
  company: string
  title: string
  phone?: string
  linkedin_url?: string
  website?: string
  city?: string
  state?: string
  country?: string
  status: ProspectStatus
  engagement_group: EngagementGroup
  opens: number
  clicks: number
  replies: number
  current_stage: number
  last_contacted_at?: string
  next_contact_at?: string
  notes?: string
  tags: string[]
  created_at: string
  updated_at: string
}

// App state types
export interface AppState {
  currentView: string
  selectedProspect: EnhancedProspect | null
  showImportDialog: boolean
  showAuth: boolean
  showLanding: boolean
  isDemo: boolean
  error: string | null
}

// Handler function types
export interface AppHandlers {
  handleGetStarted: () => void
  handleSignIn: () => void
  handleTryDemo: () => void
  handleBackToLanding: () => void
  handleExitDemo: () => void
  handleOnboardingComplete: () => void
  handleImportProspects: (data: any) => Promise<void>
  updateProspect: (id: string, updates: Partial<EnhancedProspect>) => Promise<void>
  addEngagementEvent: (prospectId: string, event: any) => Promise<void>
  handleNotificationAction: (actionUrl?: string) => void
  resetOnboarding: () => void
  navigateToBilling: () => void
  toggleMainSequence: () => void
  toggleEmailStages: () => void
  toggleProspectSearchConnection: () => void
  getSequenceStatus: () => 'active' | 'inactive' | 'setup_required'
  getEmailStagesStatus: () => 'active' | 'inactive' | 'setup_required'
  isProspectSearchConnected: () => boolean
}

// Form data types from schemas
export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  fullName: string
  confirmPassword: string
}

export interface ProspectFormData {
  name: string
  email: string
  company?: string
  title?: string
  phone?: string
  linkedin_url?: string
  website?: string
  notes?: string
}

export interface ImportFormData {
  file?: File
  prospects?: Partial<EnhancedProspect>[]
  skipDuplicates?: boolean
  overwriteExisting?: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: {
    message: string
    code?: string
  }
  success: boolean
}