import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Create Supabase client but handle gracefully if not configured
let supabase: any = null;
try {
  supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );
} catch (error) {
  console.warn('Supabase client could not be initialized:', error);
  supabase = null;
}

export { supabase };

// API helpers with graceful fallback handling
class ApiClient {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-18cd52d5`;
  private accessToken: string | null = null;
  private backendAvailable = false;

  constructor() {
    // Test backend availability on initialization
    this.testBackendAvailability();
  }

  private async testBackendAvailability() {
    try {
      // Try a simple health check - this will fail gracefully if backend isn't available
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      this.backendAvailable = response.ok;
    } catch (error) {
      console.log('Backend not available, using demo mode fallbacks');
      this.backendAvailable = false;
    }
  }

  async setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    // If backend isn't available, throw a specific error that can be caught
    if (!this.backendAvailable) {
      throw new Error('Backend not available - using demo mode');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...(publicAnonKey && { Authorization: `Bearer ${publicAnonKey}` }), // Fallback to anon key
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`API request failed (${response.status}):`, errorText);
        
        // Don't throw errors for auth issues - let the app handle gracefully
        if (response.status === 401) {
          throw new Error('Backend not available - using demo mode');
        }
        
        throw new Error(`Request failed: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.log('API request error:', error.message);
      // Always throw a generic error that won't confuse users
      throw new Error('Backend not available - using demo mode');
    }
  }

  // Authentication - these will gracefully fail and trigger demo mode
  async signUp(email: string, password: string, name: string) {
    try {
      return await this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    } catch (error) {
      console.log('Sign up API call failed, falling back to demo mode');
      throw error;
    }
  }

  // Prospects - these will gracefully fail and trigger mock data usage
  async getProspects() {
    try {
      return await this.request('/prospects');
    } catch (error) {
      console.log('Get prospects API call failed, using mock data');
      throw error;
    }
  }

  async createProspect(prospectData: any) {
    try {
      return await this.request('/prospects', {
        method: 'POST',
        body: JSON.stringify(prospectData),
      });
    } catch (error) {
      console.log('Create prospect API call failed, using local handling');
      throw error;
    }
  }

  async updateProspect(id: string, updates: any) {
    try {
      return await this.request(`/prospects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.log('Update prospect API call failed, using local handling');
      throw error;
    }
  }

  async addEngagement(prospectId: string, type: string, description: string, metadata?: any) {
    try {
      return await this.request(`/prospects/${prospectId}/engagement`, {
        method: 'POST',
        body: JSON.stringify({ type, description, metadata }),
      });
    } catch (error) {
      console.log('Add engagement API call failed, using local handling');
      throw error;
    }
  }

  async importProspects(prospects: any[]) {
    try {
      return await this.request('/prospects/import', {
        method: 'POST',
        body: JSON.stringify({ prospects }),
      });
    } catch (error) {
      console.log('Import prospects API call failed, using local handling');
      throw error;
    }
  }

  // Settings
  async getSettings() {
    try {
      return await this.request('/settings');
    } catch (error) {
      console.log('Get settings API call failed, using defaults');
      throw error;
    }
  }

  async updateSettings(settings: any) {
    try {
      return await this.request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.log('Update settings API call failed, using local handling');
      throw error;
    }
  }

  // Analytics
  async getAnalytics() {
    try {
      return await this.request('/analytics');
    } catch (error) {
      console.log('Get analytics API call failed, using mock data');
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const apiClient = new ApiClient();