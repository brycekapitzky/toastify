import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  LogOut,
  Thermometer,
  Flame,
  ArrowRight,
  Play,
  Target,
  Inbox,
  Layers,
  GraduationCap,
  Search,
  Brain,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Prospect {
  id: string;
  group: number;
  status: string;
}

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  prospects: Prospect[];
  user: SupabaseUser;
  onSignOut: () => void;
  isDemo?: boolean;
  isOnboardingCompleted: boolean;
  shouldShowOnboarding?: boolean;
  sequenceStatus?: string;
}

// Enhanced Status Indicator with Tooltip
const StatusIndicator = ({ 
  isActive, 
  className = "", 
  tooltip 
}: { 
  isActive: boolean; 
  className?: string;
  tooltip: { success: string; error: string };
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`w-2 h-2 rounded-full cursor-help ${className} ${
          isActive 
            ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' 
            : 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
        }`} />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p className="text-sm">
          {isActive ? tooltip.success : tooltip.error}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function Sidebar({ currentView, onViewChange, prospects, user, onSignOut, isDemo = false, isOnboardingCompleted, shouldShowOnboarding = false, sequenceStatus = 'paused' }: SidebarProps) {
  const [showProfile, setShowProfile] = useState(false);

  // Status tracking for feedback indicators
  const [mainSequenceStatus, setMainSequenceStatus] = useState(false);
  const [emailStagesStatus, setEmailStagesStatus] = useState(false);
  const [prospectsStatus, setProspectsStatus] = useState(false);

  // Calculate overall production status - green only if ALL are green
  const overallProductionStatus = mainSequenceStatus && emailStagesStatus && prospectsStatus;

  const getGroupCount = (group: number) => {
    if (group === 0) {
      return prospects.filter(p => p.group === 0 && p.status !== 'cold').length;
    }
    return prospects.filter(p => p.group === group).length;
  };

  const getHandOffCount = () => {
    return prospects.filter(p => p.group >= 5 || p.status === 'handoff').length;
  };

  const getAllActiveCount = () => {
    return prospects.filter(p => p.status !== 'cold').length;
  };

  // Check Main Sequence status: all messages filled + sequence activated
  const checkMainSequenceStatus = () => {
    if (isDemo) {
      // In demo mode, base it on sequence status
      setMainSequenceStatus(sequenceStatus === 'activated');
      return;
    }

    if (!user?.id) {
      setMainSequenceStatus(false);
      return;
    }

    // Check if all email stages have content
    const userEmailStagesKey = `toastify-email-stages-${user.id}`;
    const emailStagesData = localStorage.getItem(userEmailStagesKey);
    
    let allMessagesFilled = false;
    if (emailStagesData) {
      try {
        const parsed = JSON.parse(emailStagesData);
        const stages = parsed.stages || [];
        allMessagesFilled = stages.length >= 5 && stages.every((stage: any) => 
          stage.subject && stage.subject.trim().length > 0 && 
          stage.template && stage.template.trim().length > 20 // Minimum meaningful content
        );
      } catch (e) {
        allMessagesFilled = false;
      }
    }

    // Check if sequence is activated
    const userSequenceKey = `toastify-sequence-status-${user.id}`;
    const storedSequenceStatus = localStorage.getItem(userSequenceKey);
    const isActivated = storedSequenceStatus === 'activated';

    // Main sequence is only green if messages are filled AND sequence is activated
    setMainSequenceStatus(allMessagesFilled && isActivated);
  };

  // Check Email Stages status: all templates filled
  const checkEmailStagesStatus = () => {
    if (isDemo) {
      // In demo mode, show as active for demonstration
      setEmailStagesStatus(true);
      return;
    }

    if (!user?.id) {
      setEmailStagesStatus(false);
      return;
    }

    const userEmailStagesKey = `toastify-email-stages-${user.id}`;
    const emailStagesData = localStorage.getItem(userEmailStagesKey);
    
    if (emailStagesData) {
      try {
        const parsed = JSON.parse(emailStagesData);
        const stages = parsed.stages || [];
        const allFilled = stages.length >= 4 && stages.every((stage: any) => 
          stage.subject && stage.subject.trim().length > 0 && 
          stage.template && stage.template.trim().length > 20
        );
        setEmailStagesStatus(allFilled);
      } catch (e) {
        setEmailStagesStatus(false);
      }
    } else {
      setEmailStagesStatus(false);
    }
  };

  // Check Prospects status: saved search connected to main sequence
  const checkProspectsStatus = () => {
    if (isDemo) {
      // In demo mode, show as active for demonstration
      setProspectsStatus(true);
      return;
    }

    if (!user?.id) {
      setProspectsStatus(false);
      return;
    }

    // Check if there's a saved search connected to main sequence
    const userSavedSearchKey = `toastify-saved-search-${user.id}`;
    const savedSearchData = localStorage.getItem(userSavedSearchKey);
    
    let hasSavedSearch = false;
    if (savedSearchData) {
      try {
        const parsed = JSON.parse(savedSearchData);
        hasSavedSearch = parsed.isConnectedToSequence === true && parsed.filters && Object.keys(parsed.filters).length > 0;
      } catch (e) {
        hasSavedSearch = false;
      }
    }

    setProspectsStatus(hasSavedSearch);
  };

  // Update statuses when relevant data changes, including sequence status
  useEffect(() => {
    checkMainSequenceStatus();
    checkEmailStagesStatus();
    checkProspectsStatus();
  }, [user?.id, isDemo, sequenceStatus]);

  // Periodically check statuses (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      checkMainSequenceStatus();
      checkEmailStagesStatus();
      checkProspectsStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, isDemo, sequenceStatus]);

  // Tooltip messages for different status indicators
  const tooltipMessages = {
    mainSequence: {
      success: "✅ Main Sequence is ready! All email templates are filled and sequence is activated.",
      error: sequenceStatus === 'activated' 
        ? "❌ Complete setup: Fill all email templates in Email Stages to activate the indicator."
        : "❌ Complete setup: Fill all email templates in Email Stages, then click 'Start Sequence' in Main Sequence."
    },
    emailStages: {
      success: "✅ All email templates are properly filled out with subject lines and content.",
      error: "❌ Complete your email templates: Go to Email Stages and fill out all subject lines and email content."
    },
    prospects: {
      success: "✅ Saved search is connected to Main Sequence and ready to provide prospects.",
      error: "❌ Connect prospects: Go to Prospects, create and save a search to connect it to your Main Sequence."
    },
    production: {
      success: "✅ Production setup complete! Main Sequence, Email Stages, and Prospects are all configured.",
      error: "❌ Complete production setup: Finish configuring Main Sequence, Email Stages, and Prospects."
    }
  };

  const stageItems = [
    {
      id: 'cold',
      label: 'Cold',
      number: '1',
      icon: Thermometer,
      count: getGroupCount(0),
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      hoverColor: 'hover:bg-slate-200'
    },
    {
      id: 'warming',
      label: 'Warming',
      number: '2',
      icon: TrendingUp,
      count: getGroupCount(1) + getGroupCount(2),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      hoverColor: 'hover:bg-emerald-200'
    },
    {
      id: 'interested',
      label: 'Interested',
      number: '3',
      icon: Target,
      count: getGroupCount(3),
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      hoverColor: 'hover:bg-amber-200'
    },
    {
      id: 'hot-lead',
      label: 'Hot Lead',
      number: '4',
      icon: Flame,
      count: getGroupCount(4),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      hoverColor: 'hover:bg-orange-200'
    },
    {
      id: 'hand-off',
      label: 'Hand Off',
      number: '5+',
      icon: ArrowRight,
      count: getHandOffCount(),
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
      hoverColor: 'hover:bg-violet-200'
    }
  ];

  const productionSections = [
    {
      id: 'main-sequence',
      label: 'Main Sequence',
      icon: Mail,
      count: null,
      hasIndicator: true,
      indicatorStatus: mainSequenceStatus,
      tooltip: tooltipMessages.mainSequence,
      sequenceStatus: sequenceStatus
    },
    {
      id: 'email-stages',
      label: 'Email Stages',
      icon: Layers,
      count: null,
      hasIndicator: true,
      indicatorStatus: emailStagesStatus,
      tooltip: tooltipMessages.emailStages
    },
    {
      id: 'prospect-search',
      label: 'Prospects',
      icon: Search,
      count: null,
      hasIndicator: true,
      indicatorStatus: prospectsStatus,
      tooltip: tooltipMessages.prospects
    }
  ];

  // Updated management sections with AI Optimization at the top - made non-interactive
  const managementSections = [
    {
      id: 'ai-optimization',
      label: 'AI Optimization',
      icon: Brain,
      count: null,
      isNonInteractive: true // New flag to make it non-interactive
    },
    {
      id: 'inboxes',
      label: 'Inboxes',
      icon: Inbox,
      count: null
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      count: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      count: null
    }
  ];

  const renderStageItem = (item: any) => (
    <button
      key={item.id}
      onClick={() => onViewChange(item.id)}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        currentView === item.id 
          ? `bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]` 
          : `text-sidebar-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm ${item.hoverColor}`
      }`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentView === item.id 
            ? 'bg-white/20 text-white backdrop-blur-sm' 
            : `${item.bgColor} ${item.color}`
        }`}>
          {item.number}
        </div>
        <span className="font-medium text-sm">{item.label}</span>
      </div>
      <Badge 
        variant="secondary" 
        className={`h-6 px-2.5 text-xs font-semibold transition-all duration-200 ${
          currentView === item.id 
            ? 'bg-white/20 text-white border-white/30' 
            : 'bg-white/70 text-gray-700 border-gray-200'
        }`}
      >
        {item.count}
      </Badge>
      {currentView === item.id && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-xl" />
      )}
    </button>
  );

  const renderSectionItem = (item: any) => (
    <div
      key={item.id}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
        item.isNonInteractive 
          ? 'text-sidebar-foreground/60 cursor-default' // Non-interactive styling
          : currentView === item.id 
            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm cursor-pointer' 
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:shadow-sm cursor-pointer'
      }`}
      onClick={item.isNonInteractive ? undefined : () => onViewChange(item.id)}
    >
      <div className="flex items-center gap-3">
        {/* Status Indicator with Tooltip */}
        {item.hasIndicator && (
          <StatusIndicator 
            isActive={item.indicatorStatus} 
            className="flex-shrink-0"
            tooltip={item.tooltip}
          />
        )}
        
        <div className={`p-1.5 rounded-md transition-colors ${
          item.isNonInteractive
            ? 'bg-gray-100 text-gray-400'
            : currentView === item.id 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
        }`}>
          <item.icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
      </div>
      <div className="flex items-center gap-2">
        {item.count !== null && (
          <Badge variant="secondary" className="h-5 px-2 text-xs font-medium">
            {item.count}
          </Badge>
        )}
      </div>
    </div>
  );

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col shadow-sm">
      {/* Enhanced Header with Logo Status Indicator */}
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-blue-50/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg relative">
            <Mail className="h-5 w-5 text-white" />
            {/* Logo Status Indicator with Tooltip */}
            <div className="absolute -top-1 -right-1">
              <StatusIndicator 
                isActive={overallProductionStatus} 
                className="w-3 h-3 border-2 border-white"
                tooltip={tooltipMessages.production}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-sidebar-foreground">
                Toastify
              </h1>
              {/* Additional Logo Status Indicator with Tooltip */}
              <StatusIndicator 
                isActive={overallProductionStatus} 
                className="flex-shrink-0"
                tooltip={tooltipMessages.production}
              />
            </div>
            {isDemo && (
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300 mt-1">
                <Play className="h-3 w-3 mr-1" />
                DEMO
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/70 font-medium">
          Email outreach platform
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Onboarding Section - Show based on shouldShowOnboarding */}
        {shouldShowOnboarding && (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                  Get Started
                </p>
              </div>
              <button
                onClick={() => onViewChange('onboarding')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  currentView === 'onboarding' 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:shadow-sm'
                }`}
              >
                <div className={`p-1.5 rounded-md transition-colors ${
                  currentView === 'onboarding' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-500'
                }`}>
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Onboarding</span>
                <div className="ml-auto flex items-center gap-1">
                  {isOnboardingCompleted ? (
                    <Badge variant="outline" className="h-5 px-2 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-5 px-2 text-xs font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200">
                      4 Steps
                    </Badge>
                  )}
                </div>
              </button>
            </div>

            <Separator className="my-6" />
          </>
        )}

        {/* Prospect Stages */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Prospect Stages
            </p>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stageItems.map(renderStageItem)}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Production Section with Status Indicator */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider flex-1">
              Production
            </p>
            {/* Production Section Status Indicator with Tooltip */}
            <StatusIndicator 
              isActive={overallProductionStatus} 
              className="flex-shrink-0"
              tooltip={tooltipMessages.production}
            />
          </div>
          <div className="space-y-1">
            {productionSections.map(renderSectionItem)}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Management Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full"></div>
            <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Management
            </p>
          </div>
          <div className="space-y-1">
            {managementSections.map(renderSectionItem)}
          </div>
        </div>
      </div>

      {/* Enhanced User Section with Clickable Profile */}
      <div className="p-6 border-t border-sidebar-border bg-gradient-to-r from-sidebar to-gray-50/30">
        <div className="space-y-4">
          {/* Clickable Profile Section */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/60 transition-all duration-200 group"
          >
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {isDemo ? 'Demo User' : user.email}
              </p>
            </div>
            <div className="text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70 transition-colors">
              {showProfile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          
          {/* Sign Out Button - Only show when profile is expanded */}
          {showProfile && (
            <div className="pl-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-200 transition-all duration-200"
                onClick={onSignOut}
                size="sm"
              >
                <div className="p-1 rounded bg-red-100 text-red-600">
                  <LogOut className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium">{isDemo ? 'Exit Demo' : 'Sign Out'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}