import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../components/AuthContext'
import { 
  useUpdateProspect, 
  useBulkCreateProspects,
  useAddEngagementEvent 
} from './useProspects'
import { statusManager } from '../utils/statusManagement'
import { createDefaultEmailStages } from '../constants/emailTemplates'
import type { EnhancedProspect } from '../types'

export interface AppHandlers {
  // Navigation handlers
  handleGetStarted: () => void
  handleSignIn: () => void
  handleTryDemo: () => void
  handleBackToLanding: () => void
  handleExitDemo: () => void

  // Status management
  toggleMainSequence: () => string
  toggleEmailStages: () => string
  toggleProspectSearchConnection: () => boolean
  getSequenceStatus: () => string
  getEmailStagesStatus: () => string
  isProspectSearchConnected: () => boolean

  // Prospect management
  updateProspect: (id: string, updates: Partial<EnhancedProspect>) => Promise<void>
  addEngagementEvent: (prospectId: string, event: any) => Promise<void>
  handleImportProspects: (importedProspects: any[]) => Promise<void>

  // Onboarding
  handleOnboardingComplete: (data: { companyDomain: string; [key: string]: any }) => void
  resetOnboarding: () => void

  // Utility
  navigateToBilling: () => void
  handleNotificationAction: (actionUrl?: string) => void
}

interface UseAppHandlersProps {
  setShowLanding: (show: boolean) => void
  setShowAuth: (show: boolean) => void
  setAuthMode: (mode: "login" | "signup") => void
  setCurrentView: (view: string) => void
  setSelectedProspect: (prospect: EnhancedProspect | null) => void
  setShowImportDialog: (show: boolean) => void
  setError: (error: string | null) => void
  setIsNewUser: (isNew: boolean) => void
  setShowGuidedTour: (show: boolean) => void
  addNotification: (notification: any) => void
  prospects: EnhancedProspect[]
  shouldShowGuidedTour: () => boolean
  isOnboardingCompleted: () => boolean
}

export const useAppHandlers = (props: UseAppHandlersProps): AppHandlers => {
  const {
    setShowLanding,
    setShowAuth,
    setAuthMode,
    setCurrentView,
    setSelectedProspect,
    setShowImportDialog,
    setError,
    setIsNewUser,
    setShowGuidedTour,
    addNotification,
    prospects,
    shouldShowGuidedTour,
    isOnboardingCompleted,
  } = props

  const queryClient = useQueryClient()
  const { user, isDemo, signOut, enterDemoMode } = useAuth()
  const updateProspectMutation = useUpdateProspect()
  const bulkCreateProspectsMutation = useBulkCreateProspects()
  const addEngagementMutation = useAddEngagementEvent()

  // Navigation handlers
  const handleGetStarted = useCallback(() => {
    setShowLanding(false)
    setShowAuth(true)
    setAuthMode("signup")
  }, [setShowLanding, setShowAuth, setAuthMode])

  const handleSignIn = useCallback(() => {
    setShowLanding(false)
    setShowAuth(true)
    setAuthMode("login")
  }, [setShowLanding, setShowAuth, setAuthMode])

  const handleTryDemo = useCallback(() => {
    localStorage.removeItem('toastify-demo-exited')
    enterDemoMode()
    setShowLanding(false)
    setShowAuth(false)
  }, [enterDemoMode, setShowLanding, setShowAuth])

  const handleBackToLanding = useCallback(() => {
    setShowAuth(false)
    setShowLanding(true)
    setAuthMode("login")
    setError(null)
  }, [setShowAuth, setShowLanding, setAuthMode, setError])

  const handleExitDemo = useCallback(async () => {
    try {
      localStorage.removeItem('toastify-demo-prospects')
      localStorage.removeItem('demo-sequence-status')
      localStorage.removeItem('demo-stages-status')
      localStorage.removeItem('demo-prospect-search-connected')
      await signOut()
    } catch (error) {
      console.error('Failed to exit demo:', error)
    }
  }, [signOut])

  // Status management
  const toggleMainSequence = useCallback(() => {
    const newStatus = statusManager.toggleSequence(user?.id, isDemo)
    addNotification({
      type: "success",
      title: newStatus === "activated" 
        ? `Sequence Activated${isDemo ? ' (Demo)' : ''}` 
        : `Sequence Paused${isDemo ? ' (Demo)' : ''}`,
      message: `${isDemo ? 'Demo: ' : ''}Your main sequence is now ${newStatus}.`,
    })
    return newStatus
  }, [user?.id, isDemo, addNotification])

  const toggleEmailStages = useCallback(() => {
    const newStatus = statusManager.toggleEmailStages(user?.id, isDemo)
    addNotification({
      type: "success",
      title: newStatus === "activated" 
        ? `Email Stages Activated${isDemo ? ' (Demo)' : ''}` 
        : `Email Stages Paused${isDemo ? ' (Demo)' : ''}`,
      message: `${isDemo ? 'Demo: ' : ''}Your email stages are now ${newStatus}.`,
    })
    return newStatus
  }, [user?.id, isDemo, addNotification])

  const toggleProspectSearchConnection = useCallback(() => {
    const newStatus = statusManager.toggleProspectSearchConnection(user?.id, isDemo)
    addNotification({
      type: "success",
      title: newStatus 
        ? `Prospects Connected${isDemo ? ' (Demo)' : ''}` 
        : `Prospects Disconnected${isDemo ? ' (Demo)' : ''}`,
      message: `${isDemo ? 'Demo: ' : ''}Prospect search is now ${newStatus ? "connected to" : "disconnected from"} the main sequence.`,
    })
    return newStatus
  }, [user?.id, isDemo, addNotification])

  const getSequenceStatus = useCallback(() => {
    return statusManager.getSequenceStatus(user?.id, isDemo)
  }, [user?.id, isDemo])

  const getEmailStagesStatus = useCallback(() => {
    return statusManager.getEmailStagesStatus(user?.id, isDemo)
  }, [user?.id, isDemo])

  const isProspectSearchConnected = useCallback(() => {
    return statusManager.isProspectSearchConnected(user?.id, isDemo)
  }, [user?.id, isDemo])

  // Prospect management
  const updateProspect = useCallback(async (id: string, updates: Partial<EnhancedProspect>) => {
    try {
      await updateProspectMutation.mutateAsync({
        id,
        updates: {
          ...updates,
          updated_at: new Date().toISOString(),
        }
      })
      
      // Find and update the selected prospect if it matches
      const updatedProspects = queryClient.getQueryData(['prospects', user?.id, isDemo]) as EnhancedProspect[]
      const updatedProspect = updatedProspects?.find(p => p.id === id)
      if (updatedProspect) {
        setSelectedProspect({
          ...updatedProspect,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Failed to update prospect:", error)
      setError("Failed to update prospect")
    }
  }, [updateProspectMutation, setSelectedProspect, queryClient, user?.id, isDemo, setError])

  const addEngagementEvent = useCallback(async (
    prospectId: string,
    event: { type: string; description: string; metadata?: any }
  ) => {
    try {
      await addEngagementMutation.mutateAsync({
        prospectId,
        type: event.type,
        description: event.description,
        metadata: event.metadata || {}
      })

      // Add notification for replies
      if (event.type === 'email_replied') {
        const prospect = prospects.find(p => p.id === prospectId)
        if (prospect) {
          addNotification({
            type: "email",
            title: "New Email Reply",
            message: `${prospect.name} from ${prospect.company} replied to your email.`,
          })
        }
      }

      // Update selected prospect if it matches
      const updatedProspects = queryClient.getQueryData(['prospects', user?.id, isDemo]) as EnhancedProspect[]
      const updatedProspect = updatedProspects?.find(p => p.id === prospectId)
      if (updatedProspect) {
        setSelectedProspect(updatedProspect)
      }
    } catch (error) {
      console.error("Failed to add engagement:", error)
      setError("Failed to add engagement event")
    }
  }, [addEngagementMutation, prospects, addNotification, queryClient, user?.id, isDemo, setSelectedProspect, setError])

  const handleImportProspects = useCallback(async (importedProspects: any[]) => {
    try {
      await bulkCreateProspectsMutation.mutateAsync(importedProspects)
      
      setShowImportDialog(false)
      setIsNewUser(false)

      addNotification({
        type: "success",
        title: "Prospects Imported",
        message: `Successfully imported ${importedProspects.length} prospects to your campaign.`,
      })
    } catch (error) {
      console.error("Failed to import prospects:", error)
      setError("Failed to import prospects.")
    }
  }, [bulkCreateProspectsMutation, setShowImportDialog, setIsNewUser, addNotification, setError])

  // Onboarding
  const handleOnboardingComplete = useCallback((data: {
    companyDomain: string
    [key: string]: any
  }) => {
    // Save onboarding data
    if (!isDemo && user?.id) {
      const userOnboardingKey = `toastify-onboarding-${user.id}`
      localStorage.setItem(
        userOnboardingKey,
        JSON.stringify({
          ...data,
          completedAt: new Date().toISOString(),
        }),
      )

      // Create default email stages for new accounts with 21-day sequence
      const userEmailStagesKey = `toastify-email-stages-${user.id}`
      const defaultStages = createDefaultEmailStages(data.companyDomain)
      localStorage.setItem(
        userEmailStagesKey,
        JSON.stringify({
          stages: defaultStages,
          createdAt: new Date().toISOString(),
          companyDomain: data.companyDomain,
        }),
      )
    }

    setIsNewUser(false)
    setCurrentView("cold")
    setShowGuidedTour(shouldShowGuidedTour())

    addNotification({
      type: "success",
      title: "Welcome to Toastify!",
      message: `Your 4-step setup is complete for ${data.companyDomain}. 5-stage email sequence spanning 21 days is ready. Start importing prospects to begin!`,
    })
  }, [isDemo, user?.id, setIsNewUser, setCurrentView, setShowGuidedTour, shouldShowGuidedTour, addNotification])

  const resetOnboarding = useCallback(() => {
    if (!isDemo && user?.id) {
      const userOnboardingKey = `toastify-onboarding-${user.id}`
      localStorage.removeItem(userOnboardingKey)

      addNotification({
        type: "success",
        title: "Onboarding Reset",
        message: "Onboarding status has been reset. The onboarding section will appear in your sidebar again.",
      })

      window.location.reload()
    }
  }, [isDemo, user?.id, addNotification])

  // Utility
  const navigateToBilling = useCallback(() => {
    setCurrentView("settings")
    addNotification({
      type: "info",
      title: "Additional Inbox Pricing",
      message: "Additional email inboxes are available for $19/month each. Manage your subscription in the billing section below.",
    })
  }, [setCurrentView, addNotification])

  const handleNotificationAction = useCallback((actionUrl?: string) => {
    if (actionUrl) {
      console.log("Navigate to:", actionUrl)
    }
  }, [])

  return {
    handleGetStarted,
    handleSignIn,
    handleTryDemo,
    handleBackToLanding,
    handleExitDemo,
    toggleMainSequence,
    toggleEmailStages,
    toggleProspectSearchConnection,
    getSequenceStatus,
    getEmailStagesStatus,
    isProspectSearchConnected,
    updateProspect,
    addEngagementEvent,
    handleImportProspects,
    handleOnboardingComplete,
    resetOnboarding,
    navigateToBilling,
    handleNotificationAction,
  }
}