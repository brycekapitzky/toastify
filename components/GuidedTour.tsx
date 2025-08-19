import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ArrowRight, Target, Mail, Users, X, Play, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface GuidedTourProps {
  user: SupabaseUser;
  isDemo?: boolean;
  onNavigate: (view: string) => void;
  onDismiss?: () => void;
}

interface StepStatus {
  isCompleted: boolean;
  details?: string;
}

export function GuidedTour({ user, isDemo = false, onNavigate, onDismiss }: GuidedTourProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<{ [key: string]: StepStatus }>({
    emailStages: { isCompleted: false },
    mainSequence: { isCompleted: false },
    prospects: { isCompleted: false }
  });

  // Check completion status of each step
  const checkStepStatus = () => {
    if (isDemo) {
      // In demo mode, show all steps as completed for demonstration
      setStepStatuses({
        emailStages: { isCompleted: true, details: 'Demo: All templates ready' },
        mainSequence: { isCompleted: true, details: 'Demo: Sequence activated' },
        prospects: { isCompleted: true, details: 'Demo: Search connected' }
      });
      return;
    }

    if (!user?.id) return;

    const newStatuses: { [key: string]: StepStatus } = {};

    // Check Email Stages
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
        newStatuses.emailStages = {
          isCompleted: allFilled,
          details: allFilled ? `${stages.length} templates completed` : `${stages.filter((s: any) => s.subject && s.template).length}/${stages.length} templates completed`
        };
      } catch (e) {
        newStatuses.emailStages = { isCompleted: false, details: 'No templates found' };
      }
    } else {
      newStatuses.emailStages = { isCompleted: false, details: 'Email stages not set up' };
    }

    // Check Main Sequence (requires both templates and activation)
    const userSequenceKey = `toastify-sequence-status-${user.id}`;
    const sequenceStatus = localStorage.getItem(userSequenceKey);
    const isActivated = sequenceStatus === 'activated';
    const templatesReady = newStatuses.emailStages.isCompleted;
    
    newStatuses.mainSequence = {
      isCompleted: templatesReady && isActivated,
      details: !templatesReady 
        ? 'Complete email templates first' 
        : !isActivated 
          ? 'Templates ready - activate sequence'
          : 'Sequence active and ready'
    };

    // Check Prospects
    const userSavedSearchKey = `toastify-saved-search-${user.id}`;
    const savedSearchData = localStorage.getItem(userSavedSearchKey);
    
    if (savedSearchData) {
      try {
        const parsed = JSON.parse(savedSearchData);
        const hasConnectedSearch = parsed.isConnectedToSequence === true && parsed.filters && Object.keys(parsed.filters).length > 0;
        newStatuses.prospects = {
          isCompleted: hasConnectedSearch,
          details: hasConnectedSearch ? 'Search saved and connected' : 'Search saved but not connected'
        };
      } catch (e) {
        newStatuses.prospects = { isCompleted: false, details: 'No saved search found' };
      }
    } else {
      newStatuses.prospects = { isCompleted: false, details: 'No saved prospect search' };
    }

    setStepStatuses(newStatuses);
  };

  // Check completion status when component mounts and periodically
  useEffect(() => {
    checkStepStatus();
    
    const interval = setInterval(checkStepStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [user?.id, isDemo]);

  // Check if tour should be hidden or minimized due to user preference
  useEffect(() => {
    if (!isDemo && user?.id) {
      const userTourKey = `toastify-tour-dismissed-${user.id}`;
      const userTourMinimizedKey = `toastify-tour-minimized-${user.id}`;
      const tourDismissed = localStorage.getItem(userTourKey);
      const tourMinimized = localStorage.getItem(userTourMinimizedKey);
      
      if (tourDismissed) {
        setIsVisible(false);
      } else if (tourMinimized === 'true') {
        setIsMinimized(true);
      }
    }
    // For demo mode, always keep visible
    if (isDemo) {
      setIsVisible(true);
    }
  }, [user?.id, isDemo]);

  const handleDismiss = () => {
    if (!isDemo && user?.id) {
      const userTourKey = `toastify-tour-dismissed-${user.id}`;
      localStorage.setItem(userTourKey, 'true');
    }
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    
    if (!isDemo && user?.id) {
      const userTourMinimizedKey = `toastify-tour-minimized-${user.id}`;
      localStorage.setItem(userTourMinimizedKey, newMinimizedState.toString());
    }
  };

  const completedSteps = Object.values(stepStatuses).filter(status => status.isCompleted).length;
  const totalSteps = Object.keys(stepStatuses).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const steps = [
    {
      id: 'emailStages',
      title: 'Set Up Email Templates',
      description: 'Create and customize your email templates for each prospect stage',
      icon: Mail,
      action: 'Go to Email Stages',
      view: 'email-stages',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'mainSequence',
      title: 'Activate Main Sequence',
      description: 'Review your sequence and activate it to start sending emails',
      icon: Play,
      action: 'Go to Main Sequence',
      view: 'main-sequence',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 'prospects',
      title: 'Connect Prospect Search',
      description: 'Create and save a prospect search to feed your sequence',
      icon: Users,
      action: 'Go to Prospects',
      view: 'prospect-search',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 z-50 animate-in slide-in-from-bottom-2 fade-in-50">
      <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Setup Guide</CardTitle>
                {!isMinimized && (
                  <CardDescription>Complete your Toastify setup</CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-800">{completedSteps} of {totalSteps} completed</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-3">
          {steps.map((step, index) => {
            const status = stepStatuses[step.id];
            const isCompleted = status?.isCompleted || false;
            
            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                    isCompleted ? 'bg-green-500' : step.bgColor
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <step.icon className={`h-4 w-4 ${step.color}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm ${
                        isCompleted ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {step.title}
                      </h4>
                      {isCompleted && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs mb-2 ${
                      isCompleted ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                    
                    {status?.details && (
                      <p className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {status.details}
                      </p>
                    )}
                    
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate(step.view)}
                        className="mt-2 h-7 text-xs bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                      >
                        {step.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {completedSteps === totalSteps && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">🎉 Setup Complete!</h4>
              </div>
              <p className="text-sm text-green-700 mb-2">
                Your Toastify account is fully configured and ready to start generating leads.
              </p>
              <p className="text-xs text-green-600 mb-2">
                This guide will remain available. Click the X to dismiss when ready.
              </p>
            </div>
          )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}