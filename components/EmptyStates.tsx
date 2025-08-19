import React from 'react'
import { Users, Mail, FileText, Database, Inbox, Settings, TrendingUp, Search, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="w-full max-w-md text-center border-muted/40">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            {icon || <Database className="h-8 w-8 text-muted-foreground" />}
          </div>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        {(actionLabel || secondaryActionLabel) && (
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              {actionLabel && onAction && (
                <Button onClick={onAction} className="w-full">
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button variant="outline" onClick={onSecondaryAction} className="w-full">
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// Specific empty state components
export function NoProspectsEmptyState({ onImport, onAdd }: { onImport?: () => void, onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-blue-500" />}
      title="No prospects yet"
      description="Start building your prospect list by importing contacts or adding them manually. This is where your outreach journey begins!"
      actionLabel="Import Prospects"
      onAction={onImport}
      secondaryActionLabel="Add Manually"
      onSecondaryAction={onAdd}
    />
  )
}

export function NoEmailSequenceEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Mail className="h-8 w-8 text-green-500" />}
      title="No email sequences"
      description="Create your first email sequence to start automated outreach. Build personalized follow-up campaigns that convert."
      actionLabel="Create Sequence"
      onAction={onCreate}
    />
  )
}

export function NoReportsEmptyState({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <EmptyState
      icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
      title="No data to report"
      description="Reports will appear here once you start sending emails and engaging with prospects. Track your campaign performance and optimize results."
      actionLabel="Start Campaign"
      onAction={onGenerate}
    />
  )
}

export function NoInboxesEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-orange-500" />}
      title="No email inboxes connected"
      description="Connect your email accounts to start sending campaigns. You'll need at least one inbox to begin outreach."
      actionLabel="Add Inbox for $19/mo"
      onAction={onAdd}
    />
  )
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-gray-500" />}
      title={query ? `No results for "${query}"` : "No search results"}
      description={query 
        ? "Try adjusting your search terms or filters to find what you're looking for."
        : "Enter a search term to find prospects, campaigns, or other data."
      }
    />
  )
}

export function LoadingEmptyState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  )
}

export function ErrorEmptyState({ 
  onRetry, 
  message = "Something went wrong" 
}: { 
  onRetry?: () => void
  message?: string 
}) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-red-500" />}
      title="Unable to load data"
      description={message}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  )
}