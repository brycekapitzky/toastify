import React, { useState, useEffect } from "react";
import {
  useAuth,
} from "./AuthContext";
import { LandingPage } from "./LandingPage";
import { AuthPage } from "./AuthPage";
import { Sidebar } from "./Sidebar";
import { ProspectsTable } from "./ProspectsTable";
import { ProspectDrawer } from "./ProspectDrawer";
import { ReportsDashboard } from "./ReportsDashboard";
import { SettingsPage } from "./SettingsPage";
import { ImportDialog } from "./ImportDialog";
import { InboxesDashboard } from "./InboxesDashboard";
import { MainSequenceDashboard } from "./MainSequenceDashboard";
import { EmailStagesDashboard } from "./EmailStagesDashboard";
import { OnboardingDashboard } from "./OnboardingDashboard";
import { ProspectSearchDashboard } from "./ProspectSearchDashboard";
import { GuidedTour } from "./GuidedTour";
import { LoadingEmptyState } from "./EmptyStates";
import {
  NotificationSystem,
  useNotifications,
} from "./NotificationSystem";
import { 
  useProspects, 
  useUpdateProspect, 
  useBulkCreateProspects,
  useAddEngagementEvent 
} from "../hooks/useProspects";
import {
  type Prospect,
} from "./mockData";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";

// Default email stages for new accounts - Updated to span 21 days
const createDefaultEmailStages = (companyDomain: string) => [
  {
    id: "stage-1",
    name: "Initial Outreach",
    sequence: 1,
    delay: 0,
    subject: `Quick question about ${companyDomain}`,
    template: `Hi {{firstName}},

I hope this email finds you well. I came across {{company}} and was impressed by your work in the industry.

I wanted to reach out because I believe there might be a valuable opportunity for us to connect. We specialize in helping companies like {{company}} streamline their operations and increase efficiency.

Would you be open to a brief conversation to explore how we might be able to help {{company}} achieve its goals?

Best regards,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-2",
    name: "Follow-up",
    sequence: 2,
    delay: 4,
    subject: "Following up on my previous email",
    template: `Hi {{firstName}},

I wanted to follow up on my previous email about {{company}}. I understand you're busy, but I believe this could be valuable for your business.

I'd love to show you how we've helped similar companies in your industry achieve:
• 35% increase in operational efficiency
• 20% reduction in overhead costs
• Faster time-to-market for new initiatives

Would you have 15 minutes this week for a brief call?

Best regards,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-3",
    name: "Value Proposition",
    sequence: 3,
    delay: 9,
    subject: "Custom solution for {{company}}",
    template: `Hi {{firstName}},

I hope you're doing well. I've been thinking about {{company}} and wanted to share something that might be relevant to your current challenges.

Based on what I know about your industry, I've put together a brief overview of how we could help {{company}}:

✓ Streamlined processes that save time
✓ Scalable solutions that grow with your business
✓ Proven ROI from similar implementations

I'd be happy to customize this further based on {{company}}'s specific needs. When would be a good time for a 15-minute conversation?

Looking forward to connecting,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-4",
    name: "Social Proof",
    sequence: 4,
    delay: 15,
    subject: "How [Similar Company] achieved 40% growth",
    template: `Hi {{firstName}},

I wanted to share a quick success story that might resonate with your situation at {{company}}.

We recently worked with a company very similar to {{company}} that was facing challenges with efficiency and growth. Here's what we achieved together:

📈 Results in 6 months:
• 40% increase in productivity
• 25% cost reduction
• 3x faster process completion
• Improved team satisfaction

The best part? Implementation took just 4 weeks with minimal disruption to their daily operations.

I believe {{company}} could see similar results. Would you be interested in a brief conversation to explore how this could apply to your specific situation?

Best regards,
{{senderName}}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "stage-5",
    name: "Final Attempt",
    sequence: 5,
    delay: 21,
    subject: "One last attempt - {{company}}",
    template: `Hi {{firstName}},

This will be my last email, as I don't want to overwhelm your inbox.

I genuinely believe our solution could make a significant impact at {{company}}, but I understand timing isn't always right.

If you'd ever like to explore how we could help {{company}} achieve its goals more efficiently, I'm just an email away.

I wish you and {{company}} continued success.

Best regards,
{{senderName}}

P.S. If you'd prefer not to receive future emails from me, just reply with "remove" and I'll respect that request immediately.`,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export default function MainApp() {
  const {
    user,
    loading: authLoading,
    signOut,
    isDemo,
    enterDemoMode,
  } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">(
    "login",
  );
  const [currentView, setCurrentView] = useState("cold");
  const [selectedProspect, setSelectedProspect] =
    useState<Prospect | null>(null);
  const [showImportDialog, setShowImportDialog] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  // Use React Query for prospects data
  const { 
    data: prospects = [], 
    isLoading: prospectsLoading, 
    error: prospectsError,
    refetch: refetchProspects 
  } = useProspects()

  // Mutations
  const updateProspectMutation = useUpdateProspect()
  const bulkCreateProspectsMutation = useBulkCreateProspects()
  const addEngagementMutation = useAddEngagementEvent()

  // Notification system
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Check if onboarding is completed
  const isOnboardingCompleted = () => {
    if (isDemo) return true; // Demo users don't need onboarding
    if (!user?.id) return false;

    const userOnboardingKey = `toastify-onboarding-${user.id}`;
    const onboardingData = localStorage.getItem(
      userOnboardingKey,
    );
    return !!onboardingData;
  };

  // Check if onboarding should be visible in sidebar
  const shouldShowOnboarding = () => {
    // Always show onboarding in sidebar for all users (demo and real)
    return true;
  };

  // Check if guided tour should be shown - always show for demo, persistent until manually dismissed
  const shouldShowGuidedTour = () => {
    if (isDemo) return true; // Always show in demo for demonstration
    if (!user?.id) return false;

    // Check if tour was manually dismissed
    const userTourKey = `toastify-tour-dismissed-${user.id}`;
    const tourDismissed = localStorage.getItem(userTourKey);
    if (tourDismissed) return false;

    // Show tour for users who have completed onboarding - persistent until dismissed
    return isOnboardingCompleted();
  };

  // Function to toggle main sequence (activate/pause)
  const toggleMainSequence = () => {
    if (isDemo) {
      // For demo mode, just toggle the status
      const currentStatus =
        localStorage.getItem("demo-sequence-status") ||
        "paused";
      const newStatus =
        currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem("demo-sequence-status", newStatus);

      addNotification({
        type: "success",
        title:
          newStatus === "activated"
            ? "Sequence Activated (Demo)"
            : "Sequence Paused (Demo)",
        message: `Demo: Your main sequence is now ${newStatus}.`,
      });
      return;
    }

    if (user?.id) {
      const userSequenceKey = `toastify-sequence-status-${user.id}`;
      const currentStatus =
        localStorage.getItem(userSequenceKey) || "paused";
      const newStatus =
        currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem(userSequenceKey, newStatus);

      addNotification({
        type: "success",
        title:
          newStatus === "activated"
            ? "Sequence Activated"
            : "Sequence Paused",
        message: `Your main sequence is now ${newStatus}.`,
      });
    }
  };

  // Function to toggle email stages (activate/pause)
  const toggleEmailStages = () => {
    if (isDemo) {
      // For demo mode, just toggle the status
      const currentStatus =
        localStorage.getItem("demo-stages-status") || "paused";
      const newStatus =
        currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem("demo-stages-status", newStatus);

      addNotification({
        type: "success",
        title:
          newStatus === "activated"
            ? "Email Stages Activated (Demo)"
            : "Email Stages Paused (Demo)",
        message: `Demo: Your email stages are now ${newStatus}.`,
      });
      return;
    }

    if (user?.id) {
      const userStagesKey = `toastify-stages-status-${user.id}`;
      const currentStatus =
        localStorage.getItem(userStagesKey) || "paused";
      const newStatus =
        currentStatus === "activated" ? "paused" : "activated";
      localStorage.setItem(userStagesKey, newStatus);

      addNotification({
        type: "success",
        title:
          newStatus === "activated"
            ? "Email Stages Activated"
            : "Email Stages Paused",
        message: `Your email stages are now ${newStatus}.`,
      });
    }
  };

  // Function to check sequence status
  const getSequenceStatus = () => {
    if (isDemo) {
      return (
        localStorage.getItem("demo-sequence-status") || "paused"
      );
    }
    if (user?.id) {
      const userSequenceKey = `toastify-sequence-status-${user.id}`;
      return localStorage.getItem(userSequenceKey) || "paused";
    }
    return "paused";
  };

  // Function to check email stages status
  const getEmailStagesStatus = () => {
    if (isDemo) {
      return (
        localStorage.getItem("demo-stages-status") || "paused"
      );
    }
    if (user?.id) {
      const userStagesKey = `toastify-stages-status-${user.id}`;
      return localStorage.getItem(userStagesKey) || "paused";
    }
    return "paused";
  };

  // Simplified prospect search connection - just connect/disconnect
  const isProspectSearchConnected = () => {
    if (isDemo) {
      return (
        localStorage.getItem(
          "demo-prospect-search-connected",
        ) === "true"
      );
    }
    if (user?.id) {
      const userSearchKey = `toastify-prospect-search-${user.id}`;
      const searchData = localStorage.getItem(userSearchKey);
      return searchData
        ? JSON.parse(searchData).isConnected
        : false;
    }
    return false;
  };

  const toggleProspectSearchConnection = () => {
    const isCurrentlyConnected = isProspectSearchConnected();
    const newStatus = !isCurrentlyConnected;

    if (isDemo) {
      localStorage.setItem(
        "demo-prospect-search-connected",
        newStatus.toString(),
      );
      addNotification({
        type: "success",
        title: newStatus
          ? "Prospects Connected (Demo)"
          : "Prospects Disconnected (Demo)",
        message: `Demo: Prospect search is now ${newStatus ? "connected to" : "disconnected from"} the main sequence.`,
      });
    } else if (user?.id) {
      const userSearchKey = `toastify-prospect-search-${user.id}`;
      localStorage.setItem(
        userSearchKey,
        JSON.stringify({
          isConnected: newStatus,
          lastUpdated: new Date().toISOString(),
        }),
      );

      addNotification({
        type: "success",
        title: newStatus
          ? "Prospects Connected"
          : "Prospects Disconnected",
        message: `Prospect search is now ${newStatus ? "connected to" : "disconnected from"} the main sequence.`,
      });
    }
  };

  // Function to navigate to billing page
  const navigateToBilling = () => {
    setCurrentView("settings");
    // Add notification about billing for additional inboxes
    addNotification({
      type: "info",
      title: "Additional Inbox Pricing",
      message:
        "Additional email inboxes are available for $19/month each. Manage your subscription in the billing section below.",
    });
  };

  // Handle Exit Demo button click - simplified approach
  const handleExitDemo = async () => {
    console.log('Exit demo clicked');
    try {
      // Clear demo data from localStorage
      localStorage.removeItem('toastify-demo-prospects');
      localStorage.removeItem('demo-sequence-status');
      localStorage.removeItem('demo-stages-status');
      localStorage.removeItem('demo-prospect-search-connected');
      
      // Sign out to clear all auth state
      await signOut();
      
      console.log('Sign out completed, user should be null now');
    } catch (error) {
      console.error('Failed to exit demo:', error);
    }
  };

  // Check if guided tour should be shown when user/prospects change
  useEffect(() => {
    if (user) {
      setShowGuidedTour(shouldShowGuidedTour());
    }
  }, [user, isDemo, isOnboardingCompleted()]);

  // Handle when user is authenticated
  useEffect(() => {
    if (user) {
      setShowLanding(false);
      setShowAuth(false);
      
      // Check if user is new (for real users, check if they have prospects)
      if (!isDemo && prospects.length === 0 && !prospectsLoading) {
        setIsNewUser(true);
        if (!isOnboardingCompleted()) {
          setCurrentView("onboarding");
        }
      } else {
        setIsNewUser(false);
      }
    }
  }, [user, isDemo, prospects, prospectsLoading]);

  // Handle when user signs out (user becomes null) - this should handle the exit demo case
  useEffect(() => {
    console.log('User/loading effect triggered:', { user: !!user, authLoading });
    if (!user && !authLoading) {
      console.log('User is null and not loading, showing landing page');
      // User has signed out, reset to landing page
      setShowLanding(true);
      setShowAuth(false);
      setCurrentView("cold");
      setSelectedProspect(null);
      setShowImportDialog(false);
      setError(null);
      setIsNewUser(false);
      setShowGuidedTour(false);
    }
  }, [user, authLoading]);

  // Handle navigation from landing page - direct to sign up for "Get Started Free"
  const handleGetStarted = () => {
    setShowLanding(false);
    setShowAuth(true);
    setAuthMode("signup"); // Direct to sign up mode
  };

  // Handle navigation from landing page - direct to sign in for "Sign In"
  const handleSignIn = () => {
    setShowLanding(false);
    setShowAuth(true);
    setAuthMode("login"); // Direct to login mode
  };

  // Handle demo mode from landing page OR auth page
  const handleTryDemo = () => {
    console.log('Try demo handler called');
    // Clear the exit flag and enter demo mode
    localStorage.removeItem('toastify-demo-exited');
    enterDemoMode();
    setShowLanding(false);
    setShowAuth(false);
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setShowLanding(true);
    setAuthMode("login"); // Reset to default
    setError(null); // Clear any errors
  };

  // Updated filteredProspects - updated "auto-optimization" to "ai-optimization"
  const filteredProspects = prospects.filter((prospect) => {
    switch (currentView) {
      case "cold":
        return (
          prospect.group === 0 && prospect.status !== "cold"
        );
      case "warming":
        return prospect.group === 1 || prospect.group === 2;
      case "interested":
        return prospect.group === 3;
      case "hot-lead":
        return prospect.group === 4;
      case "hand-off":
        // Hand-off status only visible when engagement score > 6
        const engagementScore =
          prospect.opens + prospect.clicks;
        return (
          (prospect.group >= 5 ||
            prospect.status === "handoff") &&
          engagementScore > 6
        );
      case "main-sequence":
        return (
          prospect.status !== "cold" &&
          prospect.status !== "handoff"
        );
      case "import":
        setShowImportDialog(true);
        return prospects; // Return all for now, dialog will handle import
      case "ai-optimization":
        // This is handled in the sidebar, but just in case
        return prospects;
      default:
        return true;
    }
  });

  const updateProspect = async (updatedProspect: Prospect) => {
    try {
      await updateProspectMutation.mutateAsync({
        id: updatedProspect.id,
        updates: updatedProspect
      })
      
      setSelectedProspect({
        ...updatedProspect,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update prospect:", error);
    }
  };

  const addEngagementEvent = async (
    prospectId: string,
    type: string,
    description: string,
  ) => {
    try {
      await addEngagementMutation.mutateAsync({
        prospectId,
        type,
        description
      })

      // Add notification for replies
      if (type === 'email_replied') {
        const prospect = prospects.find(p => p.id === prospectId)
        if (prospect) {
          addNotification({
            type: "email",
            title: "New Email Reply",
            message: `${prospect.name} from ${prospect.company} replied to your email.`,
          });
        }
      }

      // Update selected prospect if it matches
      if (selectedProspect?.id === prospectId) {
        const updatedProspect = prospects.find(p => p.id === prospectId)
        if (updatedProspect) {
          setSelectedProspect(updatedProspect as Prospect)
        }
      }
    } catch (error) {
      console.error("Failed to add engagement:", error);
    }
  };

  const handleImportProspects = async (
    importedProspects: any[],
  ) => {
    try {
      await bulkCreateProspectsMutation.mutateAsync(importedProspects)
      
      setShowImportDialog(false);
      setIsNewUser(false); // User is no longer new after importing prospects

      // Add notification
      addNotification({
        type: "success",
        title: "Prospects Imported",
        message: `Successfully imported ${importedProspects.length} prospects to your campaign.`,
      });
    } catch (error) {
      console.error("Failed to import prospects:", error);
      setError("Failed to import prospects.");
    }
  };

  // Updated onboarding completion handler to support the 4-step process
  const handleOnboardingComplete = (data: {
    companyDomain: string;
    [key: string]: any;
  }) => {
    // Save onboarding data
    if (!isDemo && user?.id) {
      const userOnboardingKey = `toastify-onboarding-${user.id}`;
      localStorage.setItem(
        userOnboardingKey,
        JSON.stringify({
          ...data,
          completedAt: new Date().toISOString(),
        }),
      );

      // Create default email stages for new accounts with 21-day sequence
      const userEmailStagesKey = `toastify-email-stages-${user.id}`;
      const defaultStages = createDefaultEmailStages(
        data.companyDomain,
      );
      localStorage.setItem(
        userEmailStagesKey,
        JSON.stringify({
          stages: defaultStages,
          createdAt: new Date().toISOString(),
          companyDomain: data.companyDomain,
        }),
      );
    }

    setIsNewUser(false);
    setCurrentView("cold"); // Navigate to main prospects view
    setShowGuidedTour(shouldShowGuidedTour()); // Show guided tour after onboarding

    // Add welcome notification with info about the 21-day sequence
    addNotification({
      type: "success",
      title: "Welcome to Toastify!",
      message: `Your 4-step setup is complete for ${data.companyDomain}. 5-stage email sequence spanning 21 days is ready. Start importing prospects to begin!`,
    });
  };

  // Function to reset onboarding status
  const resetOnboarding = () => {
    if (!isDemo && user?.id) {
      const userOnboardingKey = `toastify-onboarding-${user.id}`;
      localStorage.removeItem(userOnboardingKey);

      addNotification({
        type: "success",
        title: "Onboarding Reset",
        message:
          "Onboarding status has been reset. The onboarding section will appear in your sidebar again.",
      });

      // Force a page refresh to update sidebar
      window.location.reload();
    }
  };

  const handleNotificationAction = (notification: any) => {
    // Handle notification clicks - navigate to relevant views
    if (notification.actionUrl) {
      // Parse URL and navigate accordingly
      console.log("Navigate to:", notification.actionUrl);
    }
  };

  const renderMainContent = () => {
    // Show loading for auth or prospects
    if (authLoading || prospectsLoading) {
      return <LoadingEmptyState message={
        authLoading ? "Loading application..." : "Loading your prospects..."
      } />
    }

    // Handle prospects error
    if (prospectsError && !isDemo) {
      return (
        <div className="p-6">
          <Alert variant="destructive" className="border border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <AlertDescription className="text-red-800">
              Failed to load prospects data. Please check your connection and try again.
              <button 
                onClick={() => refetchProspects()}
                className="ml-2 underline hover:no-underline font-medium"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    switch (currentView) {
      case "onboarding":
        return (
          <OnboardingDashboard
            onNavigate={setCurrentView}
            onComplete={handleOnboardingComplete}
            isDemo={isDemo}
          />
        );
      case "inboxes":
        return (
          <InboxesDashboard
            onNavigateToBilling={navigateToBilling}
          />
        );
      case "main-sequence":
        return (
          <MainSequenceDashboard
            prospects={filteredProspects}
            onToggleSequence={toggleMainSequence}
            sequenceStatus={getSequenceStatus()}
          />
        );
      case "email-stages":
        return (
          <EmailStagesDashboard
            onToggleStages={toggleEmailStages}
            stagesStatus={getEmailStagesStatus()}
          />
        );
      case "prospect-search":
        return (
          <ProspectSearchDashboard
            onToggleConnection={toggleProspectSearchConnection}
            isConnected={isProspectSearchConnected()}
          />
        );
      case "reports":
        return <ReportsDashboard prospects={prospects} />;
      case "settings":
        return (
          <SettingsPage
            isDemo={isDemo}
            user={user}
            onMarkOnboardingComplete={() => {
              // Allow users to mark onboarding as complete from settings
              if (!isDemo && user?.id) {
                const userOnboardingKey = `toastify-onboarding-${user.id}`;
                localStorage.setItem(
                  userOnboardingKey,
                  JSON.stringify({
                    completedAt: new Date().toISOString(),
                    markedCompleteFromSettings: true,
                  }),
                );
                addNotification({
                  type: "success",
                  title: "Onboarding Marked Complete",
                  message:
                    "The onboarding section will no longer appear in your sidebar.",
                });
                // Force a page refresh to update sidebar
                window.location.reload();
              }
            }}
            onResetOnboarding={resetOnboarding}
          />
        );
      default:
        return (
          <ProspectsTable
            prospects={filteredProspects}
            onSelectProspect={setSelectedProspect}
            currentView={currentView}
            onImportClick={() => setShowImportDialog(true)}
            onAddEngagement={addEngagementEvent}
            isDemo={isDemo}
          />
        );
    }
  };

  console.log('App render state:', { 
    user: !!user, 
    authLoading, 
    showLanding, 
    showAuth, 
    isDemo 
  });

  if (authLoading) {
    return <LoadingEmptyState message="Loading application..." />
  }

  // Show landing page first if user is not authenticated and hasn't chosen to proceed
  if (!user && showLanding && !showAuth) {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
        onTryDemo={handleTryDemo}
      />
    );
  }

  // Show auth page if user clicked to proceed or is returning from landing
  if (!user) {
    return (
      <AuthPage
        onBackToLanding={handleBackToLanding}
        onTryDemo={handleTryDemo}
        initialMode={authMode}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        prospects={prospects}
        user={user}
        onSignOut={signOut}
        isDemo={isDemo}
        isOnboardingCompleted={isOnboardingCompleted()}
        shouldShowOnboarding={shouldShowOnboarding()}
        sequenceStatus={getSequenceStatus()}
        isProspectSearchConnected={isProspectSearchConnected()}
      />

      <main className="flex-1 flex flex-col">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300 font-medium"
                >
                  🎮 Demo Mode
                </Badge>
                <span className="text-sm text-amber-800 font-medium">
                  You're exploring Toastify with{" "}
                  {prospects.length} sample prospects. Perfect
                  for testing features!
                </span>
              </div>
              <div className="flex items-center gap-3">
                <NotificationSystem
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                  onNotificationAction={
                    handleNotificationAction
                  }
                />
                <button
                  onClick={handleExitDemo}
                  className="text-sm text-amber-800 hover:text-amber-900 underline font-medium transition-colors"
                >
                  Exit Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular App Header with Notifications */}
        {!isDemo && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isNewUser ? (
                  <>
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 font-medium"
                    >
                      🚀 New Account
                    </Badge>
                    <span className="text-sm text-green-800 font-medium">
                      Welcome! Complete the 4-step onboarding to
                      start your 21-day outreach sequence.
                    </span>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300 font-medium"
                    >
                      ✨ Live Account
                    </Badge>
                    <span className="text-sm text-blue-800 font-medium">
                      You're using Toastify with{" "}
                      {prospects.length} prospects in your
                      account.
                    </span>
                  </>
                )}
              </div>
              <NotificationSystem
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
                onNotificationAction={handleNotificationAction}
              />
            </div>
          </div>
        )}

        {/* Error Alert - Only show critical errors */}
        {error && (
          <div className="p-4">
            <Alert
              variant="destructive"
              className="border border-red-200 bg-gradient-to-r from-red-50 to-pink-50"
            >
              <AlertDescription className="text-red-800">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 underline hover:no-underline font-medium"
                >
                  Dismiss
                </button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">{renderMainContent()}</div>
      </main>

      {selectedProspect && (
        <ProspectDrawer
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onUpdate={updateProspect}
          onAddEngagement={addEngagementEvent}
          isDemo={isDemo}
        />
      )}

      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={handleImportProspects}
          isDemo={isDemo}
        />
      )}

      {/* Guided Tour Component */}
      {showGuidedTour && user && (
        <GuidedTour
          user={user}
          isDemo={isDemo}
          onNavigate={setCurrentView}
          onDismiss={() => setShowGuidedTour(false)}
        />
      )}
    </div>
  );
}