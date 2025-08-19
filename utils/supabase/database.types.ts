export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_domain: string | null
          onboarding_completed: boolean
          onboarding_data: Json
          subscription_status: string
          subscription_plan: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_domain?: string | null
          onboarding_completed?: boolean
          onboarding_data?: Json
          subscription_status?: string
          subscription_plan?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_domain?: string | null
          onboarding_completed?: boolean
          onboarding_data?: Json
          subscription_status?: string
          subscription_plan?: string
        }
        Relationships: []
      }
      prospects: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          company: string | null
          title: string | null
          phone: string | null
          linkedin_url: string | null
          website: string | null
          city: string | null
          state: string | null
          country: string | null
          status: Database['public']['Enums']['prospect_status']
          engagement_group: number
          opens: number
          clicks: number
          replies: number
          current_stage: number
          last_contacted_at: string | null
          next_contact_at: string | null
          notes: string | null
          tags: string[]
          custom_data: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          company?: string | null
          title?: string | null
          phone?: string | null
          linkedin_url?: string | null
          website?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          status?: Database['public']['Enums']['prospect_status']
          engagement_group?: number
          opens?: number
          clicks?: number
          replies?: number
          current_stage?: number
          last_contacted_at?: string | null
          next_contact_at?: string | null
          notes?: string | null
          tags?: string[]
          custom_data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          company?: string | null
          title?: string | null
          phone?: string | null
          linkedin_url?: string | null
          website?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          status?: Database['public']['Enums']['prospect_status']
          engagement_group?: number
          opens?: number
          clicks?: number
          replies?: number
          current_stage?: number
          last_contacted_at?: string | null
          next_contact_at?: string | null
          notes?: string | null
          tags?: string[]
          custom_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "prospects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      engagement_events: {
        Row: {
          id: string
          prospect_id: string
          user_id: string
          created_at: string
          type: Database['public']['Enums']['engagement_type']
          description: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          prospect_id: string
          user_id: string
          created_at?: string
          type: Database['public']['Enums']['engagement_type']
          description?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          prospect_id?: string
          user_id?: string
          created_at?: string
          type?: Database['public']['Enums']['engagement_type']
          description?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "engagement_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      email_stages: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          sequence: number
          delay_days: number
          subject: string
          template: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          sequence: number
          delay_days?: number
          subject: string
          template: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          sequence?: number
          delay_days?: number
          subject?: string
          template?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_stages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      inboxes: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          provider: string
          is_connected: boolean
          is_warming_up: boolean
          warm_up_daily_limit: number
          connection_data: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          provider?: string
          is_connected?: boolean
          is_warming_up?: boolean
          warm_up_daily_limit?: number
          connection_data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          provider?: string
          is_connected?: boolean
          is_warming_up?: boolean
          warm_up_daily_limit?: number
          connection_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "inboxes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sequences: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          is_active: boolean
          daily_limit: number
          settings: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          is_active?: boolean
          daily_limit?: number
          settings?: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          is_active?: boolean
          daily_limit?: number
          settings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sequences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      prospect_status: 'cold' | 'contacted' | 'replied' | 'interested' | 'qualified' | 'handoff'
      engagement_type: 'email_sent' | 'email_opened' | 'email_clicked' | 'email_replied' | 'email_bounced' | 'call_made' | 'meeting_scheduled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}