'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js'
import { supabase, isClientConfigured } from '../lib/supabaseClient'
import { getProfile, updateProfile, completeOnboarding } from '../utils/supabase/api'
import type { Database } from '../utils/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  enterDemoMode: () => void
  exitDemoMode: () => void
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>
  completeUserOnboarding: (onboardingData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Check for demo mode on initialization
  useEffect(() => {
    const demoMode = localStorage.getItem('toastify-demo-mode')
    if (demoMode === 'true') {
      setIsDemo(true)
      setUser({
        id: 'demo-user',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'demo@toastify.app',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          full_name: 'Demo User',
          avatar_url: null,
        },
      } as User)
      setLoading(false)
      return
    }

    // Initialize Supabase auth if configured
    if (isClientConfigured() && supabase?.auth) {
      initializeAuth()
    } else {
      console.warn('Supabase not configured - authentication disabled')
      setLoading(false)
    }
  }, [])

  const initializeAuth = async () => {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase!.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else if (session) {
        setSession(session)
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      )

      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await getProfile(userId)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Create profile if it doesn't exist
      if (user?.email) {
        try {
          const newProfile = await updateProfile(userId, {
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
          })
          setProfile(newProfile)
        } catch (createError) {
          console.error('Error creating user profile:', createError)
        }
      }
    }
  }

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    if (!isClientConfigured()) {
      throw new Error('Authentication not configured')
    }

    setLoading(true)
    try {
      const response = await supabase!.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (response.error) {
        console.error('Sign in error:', response.error)
      }

      return response
    } catch (error) {
      console.error('Sign in exception:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    fullName?: string
  ): Promise<AuthResponse> => {
    if (!isClientConfigured()) {
      throw new Error('Authentication not configured')
    }

    setLoading(true)
    try {
      const response = await supabase!.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName || null,
          },
        },
      })

      if (response.error) {
        console.error('Sign up error:', response.error)
      }

      return response
    } catch (error) {
      console.error('Sign up exception:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isClientConfigured()) {
      throw new Error('Authentication not configured')
    }

    try {
      const { error } = await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }
    } catch (error) {
      console.error('Google sign in exception:', error)
      throw error
    }
  }, [])

  const signInWithGitHub = useCallback(async () => {
    if (!isClientConfigured()) {
      throw new Error('Authentication not configured')
    }

    try {
      const { error } = await supabase!.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('GitHub sign in error:', error)
        throw error
      }
    } catch (error) {
      console.error('GitHub sign in exception:', error)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    console.log('Sign out called')
    
    if (isDemo) {
      console.log('Exiting demo mode')
      exitDemoMode()
      return
    }

    if (!isClientConfigured()) {
      console.log('Supabase not configured, clearing local state')
      setUser(null)
      setProfile(null)
      setSession(null)
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase!.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }

      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      
      console.log('Sign out completed successfully')
    } catch (error) {
      console.error('Sign out exception:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  const enterDemoMode = useCallback(() => {
    console.log('Entering demo mode')
    
    // Clear any existing auth state
    if (isClientConfigured()) {
      supabase?.auth.signOut().catch(console.error)
    }
    
    // Set demo state
    localStorage.setItem('toastify-demo-mode', 'true')
    setIsDemo(true)
    setUser({
      id: 'demo-user',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'demo@toastify.app',
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {
        full_name: 'Demo User',
        avatar_url: null,
      },
    } as User)
    setProfile({
      id: 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: 'demo@toastify.app',
      full_name: 'Demo User',
      avatar_url: null,
      company_domain: 'demo.com',
      onboarding_completed: true,
      onboarding_data: { demoMode: true },
      subscription_status: 'free',
      subscription_plan: 'demo',
    })
    setSession(null)
    setLoading(false)
  }, [])

  const exitDemoMode = useCallback(() => {
    console.log('Exiting demo mode')
    localStorage.removeItem('toastify-demo-mode')
    setIsDemo(false)
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
  }, [])

  const updateUserProfile = useCallback(async (updates: Partial<Profile>) => {
    if (isDemo || !user?.id || !isClientConfigured()) {
      throw new Error('Cannot update profile in demo mode or when not authenticated')
    }

    try {
      const updatedProfile = await updateProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }, [user?.id, isDemo])

  const completeUserOnboarding = useCallback(async (onboardingData: any) => {
    if (isDemo || !user?.id || !isClientConfigured()) {
      // Handle demo mode onboarding completion locally
      if (isDemo) {
        const updatedProfile = {
          ...profile!,
          onboarding_completed: true,
          onboarding_data: onboardingData,
          company_domain: onboardingData.companyDomain,
          updated_at: new Date().toISOString(),
        }
        setProfile(updatedProfile)
        return
      }
      throw new Error('Cannot complete onboarding when not authenticated')
    }

    try {
      const updatedProfile = await completeOnboarding(user.id, onboardingData)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw error
    }
  }, [user?.id, isDemo, profile])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isDemo,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    enterDemoMode,
    exitDemoMode,
    updateUserProfile,
    completeUserOnboarding,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }