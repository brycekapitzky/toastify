import { z } from 'zod'

// Prospect validation schemas
export const ProspectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  company: z.string().min(1, 'Company is required').max(100, 'Company name is too long'),
  title: z.string().max(100, 'Title is too long').optional(),
  phone: z.string().max(50, 'Phone number is too long').optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  timezone: z.string().default('America/New_York'),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000, 'Notes are too long').default(''),
})

export const BulkProspectSchema = z.array(ProspectSchema).min(1, 'At least one prospect is required')

export const ProspectUpdateSchema = ProspectSchema.partial().omit({ id: true })

// Form validation schemas
export const ProspectFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  company: z.string().min(1, 'Company is required').max(100, 'Company name is too long'),
  title: z.string().max(100, 'Title is too long').optional(),
  phone: z.string().max(50, 'Phone number is too long').optional(),
  linkedin: z.string().refine(
    (val) => !val || val === '' || /^https?:\/\/(www\.)?linkedin\.com\//.test(val),
    'Invalid LinkedIn URL'
  ).optional(),
  website: z.string().refine(
    (val) => !val || val === '' || /^https?:\/\//.test(val),
    'Invalid website URL'
  ).optional(),
  timezone: z.string().default('America/New_York'),
  tags: z.string().transform(val => 
    val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []
  ).default(''),
  notes: z.string().max(1000, 'Notes are too long').default(''),
})

// CSV import validation
export const CSVProspectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required'),
  title: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  website: z.string().optional().default(''),
  timezone: z.string().optional().default('America/New_York'),
  tags: z.string().optional().default(''),
  notes: z.string().optional().default(''),
}).transform((data) => ({
  ...data,
  tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
}))

// Email sequence schemas
export const EmailStepSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Step name is required').max(100, 'Name is too long'),
  delay: z.number().min(0, 'Delay cannot be negative').max(90, 'Delay cannot exceed 90 days'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  template: z.string().min(1, 'Template is required').max(5000, 'Template is too long'),
  isActive: z.boolean().default(true),
})

export const EmailSequenceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Sequence name is required').max(100, 'Name is too long'),
  steps: z.array(EmailStepSchema).min(1, 'At least one step is required'),
  isActive: z.boolean().default(true),
})

// Settings schemas
export const UserSettingsSchema = z.object({
  companyDomain: z.string().min(1, 'Company domain is required'),
  senderName: z.string().min(1, 'Sender name is required').max(100, 'Name is too long'),
  senderEmail: z.string().email('Invalid email address'),
  timezone: z.string().default('America/New_York'),
  dailyLimit: z.number().min(1, 'Daily limit must be at least 1').max(500, 'Daily limit cannot exceed 500'),
  sequenceStatus: z.enum(['active', 'paused']).default('paused'),
  stagesStatus: z.enum(['active', 'paused']).default('paused'),
  prospectSearchConnected: z.boolean().default(false),
})

// Onboarding schema
export const OnboardingSchema = z.object({
  companyDomain: z.string().min(1, 'Company domain is required').max(100, 'Domain is too long'),
  senderName: z.string().min(1, 'Your name is required').max(100, 'Name is too long'),
  senderTitle: z.string().min(1, 'Your title is required').max(100, 'Title is too long'),
  targetAudience: z.string().min(1, 'Target audience is required').max(500, 'Description is too long'),
  primaryGoal: z.enum(['lead-generation', 'sales', 'partnerships', 'networking', 'other']),
})

// Types derived from schemas
export type Prospect = z.infer<typeof ProspectSchema>
export type ProspectForm = z.infer<typeof ProspectFormSchema>
export type ProspectUpdate = z.infer<typeof ProspectUpdateSchema>
export type CSVProspect = z.infer<typeof CSVProspectSchema>
export type EmailStep = z.infer<typeof EmailStepSchema>
export type EmailSequence = z.infer<typeof EmailSequenceSchema>
export type UserSettings = z.infer<typeof UserSettingsSchema>
export type OnboardingData = z.infer<typeof OnboardingSchema>