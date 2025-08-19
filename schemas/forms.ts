import { z } from 'zod'

// Prospect form schema
export const prospectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  title: z
    .string()
    .max(100, 'Job title must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  linkedin_url: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .refine((url) => url.includes('linkedin.com'), 'Must be a LinkedIn URL')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(50, 'City must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(50, 'State must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(50, 'Country must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().trim().min(1))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
})

export type ProspectFormData = z.infer<typeof prospectSchema>

// Bulk import schema
export const bulkImportSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'Please select a file')
    .refine(
      (file) => file && file.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB'
    )
    .refine(
      (file) => {
        if (!file) return false
        const allowedTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
        ]
        return allowedTypes.includes(file.type)
      },
      'File must be CSV, Excel, or text format'
    ),
  skipDuplicates: z.boolean().default(true),
  overwriteExisting: z.boolean().default(false),
})

export type BulkImportFormData = z.infer<typeof bulkImportSchema>

// Manual prospect addition (array of prospects)
export const manualProspectsSchema = z.object({
  prospects: z
    .array(prospectSchema)
    .min(1, 'At least one prospect is required')
    .max(100, 'Maximum 100 prospects per import'),
})

export type ManualProspectsFormData = z.infer<typeof manualProspectsSchema>

// Email stage schema
export const emailStageSchema = z.object({
  name: z
    .string()
    .min(3, 'Stage name must be at least 3 characters long')
    .max(100, 'Stage name must be less than 100 characters')
    .trim(),
  sequence: z
    .number()
    .int()
    .min(1, 'Sequence must be at least 1')
    .max(20, 'Maximum 20 stages allowed'),
  delay_days: z
    .number()
    .int()
    .min(0, 'Delay cannot be negative')
    .max(365, 'Delay cannot exceed 365 days'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters long')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  template: z
    .string()
    .min(20, 'Template must be at least 20 characters long')
    .max(5000, 'Template must be less than 5000 characters')
    .trim(),
  is_active: z.boolean().default(true),
})

export type EmailStageFormData = z.infer<typeof emailStageSchema>

// Multiple email stages
export const emailStagesSchema = z.object({
  stages: z
    .array(emailStageSchema)
    .min(1, 'At least one email stage is required')
    .max(20, 'Maximum 20 email stages allowed'),
})

export type EmailStagesFormData = z.infer<typeof emailStagesSchema>

// Inbox configuration schema
export const inboxSchema = z.object({
  name: z
    .string()
    .min(3, 'Inbox name must be at least 3 characters long')
    .max(50, 'Inbox name must be less than 50 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  provider: z
    .enum(['gmail', 'outlook', 'custom'], {
      required_error: 'Please select an email provider',
    }),
  warm_up_daily_limit: z
    .number()
    .int()
    .min(1, 'Daily limit must be at least 1')
    .max(500, 'Daily limit cannot exceed 500'),
  is_warming_up: z.boolean().default(false),
})

export type InboxFormData = z.infer<typeof inboxSchema>

// Settings form schema
export const settingsSchema = z.object({
  profile: z.object({
    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters long')
      .max(100, 'Full name must be less than 100 characters')
      .trim(),
    company_domain: z
      .string()
      .url('Please enter a valid domain URL')
      .or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Please enter a valid domain'))
      .optional()
      .or(z.literal('')),
  }),
  preferences: z.object({
    timezone: z.string().optional(),
    email_signature: z
      .string()
      .max(500, 'Email signature must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    notifications: z.object({
      email: z.boolean().default(true),
      browser: z.boolean().default(true),
      mobile: z.boolean().default(true),
    }),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
  }),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

// Onboarding form schema
export const onboardingSchema = z.object({
  step1: z.object({
    companyDomain: z
      .string()
      .min(1, 'Company domain is required')
      .url('Please enter a valid domain URL')
      .or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Please enter a valid domain')),
    industry: z
      .string()
      .min(2, 'Please select or enter your industry')
      .max(100, 'Industry must be less than 100 characters')
      .trim(),
  }),
  step2: z.object({
    teamSize: z.enum(['1', '2-5', '6-10', '11-25', '26-50', '51-100', '100+'], {
      required_error: 'Please select your team size',
    }),
    role: z
      .string()
      .min(2, 'Please enter your role')
      .max(100, 'Role must be less than 100 characters')
      .trim(),
  }),
  step3: z.object({
    goals: z
      .array(z.string())
      .min(1, 'Please select at least one goal')
      .max(5, 'Maximum 5 goals allowed'),
    monthlyTarget: z
      .number()
      .int()
      .min(1, 'Monthly target must be at least 1')
      .max(10000, 'Monthly target seems too high'),
  }),
  step4: z.object({
    agreedToTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the terms and conditions'),
    subscribedToUpdates: z.boolean().default(true),
  }),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// Search and filter schema
export const searchFilterSchema = z.object({
  query: z.string().trim().optional(),
  status: z
    .enum(['all', 'cold', 'contacted', 'replied', 'interested', 'qualified', 'handoff'])
    .default('all'),
  engagement_group: z
    .number()
    .int()
    .min(0)
    .max(6)
    .optional(),
  company: z.string().trim().optional(),
  date_range: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  sort_by: z
    .enum(['name', 'email', 'company', 'created_at', 'updated_at', 'engagement_group'])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(10).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export type SearchFilterFormData = z.infer<typeof searchFilterSchema>

// Engagement event schema
export const engagementEventSchema = z.object({
  type: z.enum([
    'email_sent',
    'email_opened',
    'email_clicked',
    'email_replied',
    'email_bounced',
    'call_made',
    'meeting_scheduled',
  ], {
    required_error: 'Please select an engagement type',
  }),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters long')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  metadata: z.record(z.any()).optional(),
})

export type EngagementEventFormData = z.infer<typeof engagementEventSchema>