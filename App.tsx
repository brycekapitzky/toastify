import React, { useState, useEffect } from "react";
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  AuthProvider,
  useAuth,
} from "./components/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { Sidebar } from "./components/Sidebar";
import { ProspectsTable } from "./components/ProspectsTable";
import { ProspectDrawer } from "./components/ProspectDrawer";
import { ReportsDashboard } from "./components/ReportsDashboard";
import { SettingsPage } from "./components/SettingsPage";
import { ImportDialog } from "./components/ImportDialog";
import { InboxesDashboard } from "./components/InboxesDashboard";
import { MainSequenceDashboard } from "./components/MainSequenceDashboard";
import { EmailStagesDashboard } from "./components/EmailStagesDashboard";
import { OnboardingDashboard } from "./components/OnboardingDashboard";
import { ProspectSearchDashboard } from "./components/ProspectSearchDashboard";
import { GuidedTour } from "./components/GuidedTour";
import { LoadingEmptyState } from "./components/EmptyStates";
import {
  NotificationSystem,
  useNotifications,
} from "./components/NotificationSystem";
import { useProspects } from "./hooks/useProspects";
import { useAppHandlers } from "./hooks/useAppHandlers";
import { queryClient } from "./config/queryClient";
import { filterProspectsByView } from "./utils/prospectFilters";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Badge } from "./components/ui/badge";
import type { EnhancedProspect } from "./types";

function MainApp() {
  const { user, loading: authLoading, signOut, isDemo } = useAuth();
  
  // UI State
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [currentView, setCurrentView] = useState("cold");
  const [selectedProspect, setSelectedProspect] = useState<EnhancedProspect | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  // Data
  const { 
    data: prospects = [], 
    isLoading: prospectsLoading, 
    error: prospectsError,
    refetch: refetchProspects 
  } = useProspects();

  // Notifications
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Helper functions
  const isOnboardingCompleted = () => {
    if (isDemo) return true;
    if (!user?.id) return false;
    const userOnboardingKey = `toastify-onboarding-${user.id}`;
    return !!localStorage.getItem(userOnboardingKey);
  };

  const shouldShowOnboarding = () => true;

  const shouldShowGuidedTour = () => {
    if (isDemo) return true;
    if (!user?.id) return false;
    const userTourKey = `toastify-tour-dismissed-${user.id}`;
    const tourDismissed = localStorage.getItem(userTourKey);
    if (tourDismissed) return false;
    return isOnboardingCompleted();
  };

  // Handlers
  const handlers = useAppHandlers({
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
  });

  // Effects
  useEffect(() => {
    if (user) {
      setShowGuidedTour(shouldShowGuidedTour());
    }
  }, [user, isDemo]);

  useEffect(() => {
    if (user) {
      setShowLanding(false);
      setShowAuth(false);
      
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

  useEffect(() => {
    if (!user && !authLoading) {
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

  // Render helpers
  const filteredProspects = filterProspectsByView(prospects, currentView);

  const handleMarkOnboardingComplete = () => {
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
        message: "The onboarding section will no longer appear in your sidebar.",
      });
      window.location.reload();
    }
  };

  const renderMainContent = () => {
    if (authLoading || prospectsLoading) {
      return <LoadingEmptyState message={
        authLoading ? "Loading application..." : "Loading your prospects..."
      } />;
    }

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
      );
    }

    // Handle import dialog trigger
    if (currentView === "import") {
      setShowImportDialog(true);
    }

    const componentMap: Record<string, JSX.Element> = {
      onboarding: (
        <OnboardingDashboard
          onNavigate={setCurrentView}
          onComplete={handlers.handleOnboardingComplete}
          isDemo={isDemo}
        />
      ),
      inboxes: <InboxesDashboard onNavigateToBilling={handlers.navigateToBilling} />,
      "main-sequence": (
        <MainSequenceDashboard
          prospects={filteredProspects}
          onToggleSequence={handlers.toggleMainSequence}
          sequenceStatus={handlers.getSequenceStatus()}
        />
      ),
      "email-stages": (
        <EmailStagesDashboard
          onToggleStages={handlers.toggleEmailStages}
          stagesStatus={handlers.getEmailStagesStatus()}
        />
      ),
      "prospect-search": (
        <ProspectSearchDashboard
          onToggleConnection={handlers.toggleProspectSearchConnection}
          isConnected={handlers.isProspectSearchConnected()}
        />
      ),
      reports: <ReportsDashboard prospects={prospects} />,
      settings: (
        <SettingsPage
          isDemo={isDemo}
          user={user}
          onMarkOnboardingComplete={handleMarkOnboardingComplete}
          onResetOnboarding={handlers.resetOnboarding}
        />
      ),
    };

    return componentMap[currentView] || (
      <ProspectsTable
        prospects={filteredProspects}
        onSelectProspect={setSelectedProspect}
        currentView={currentView}
        onImportClick={() => setShowImportDialog(true)}
        onAddEngagement={handlers.addEngagementEvent}
        isDemo={isDemo}
      />
    );
  };

  // Main render logic
  if (authLoading) {
    return <LoadingEmptyState message="Loading application..." />;
  }

  if (!user && showLanding && !showAuth) {
    return (
      <LandingPage
        onGetStarted={handlers.handleGetStarted}
        onSignIn={handlers.handleSignIn}
        onTryDemo={handlers.handleTryDemo}
      />
    );
  }

  if (!user) {
    return (
      <AuthPage
        onBackToLanding={handlers.handleBackToLanding}
        onTryDemo={handlers.handleTryDemo}
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
        sequenceStatus={handlers.getSequenceStatus()}
        isProspectSearchConnected={handlers.isProspectSearchConnected()}
      />

      <main className="flex-1 flex flex-col">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3" data-testid="demo-banner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300 font-medium"
                >
                  🎮 Demo Mode
                </Badge>
                <span className="text-sm text-amber-800 font-medium">
                  You're exploring Toastify with {prospects.length} sample prospects. Perfect for testing features!
                </span>
              </div>
              <div className="flex items-center gap-3">
                <NotificationSystem
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                  onNotificationAction={handlers.handleNotificationAction}
                />
                <button
                  onClick={handlers.handleExitDemo}
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
                      Welcome! Complete the 4-step onboarding to start your 21-day outreach sequence.
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
                      You're using Toastify with {prospects.length} prospects in your account.
                    </span>
                  </>
                )}
              </div>
              <NotificationSystem
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
                onNotificationAction={handlers.handleNotificationAction}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive" className="border border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
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

        <div className="flex-1">{renderMainContent()}</div>
      </main>

      {selectedProspect && (
        <ProspectDrawer
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onUpdate={handlers.updateProspect}
          onAddEngagement={handlers.addEngagementEvent}
          isDemo={isDemo}
        />
      )}

      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={handlers.handleImportProspects}
          isDemo={isDemo}
        />
      )}

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

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo)
        // TODO: Send to error reporting service
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}