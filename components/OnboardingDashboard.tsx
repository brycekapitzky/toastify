import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  Globe, 
  Mail, 
  Sparkles,
  Brain,
  CheckIcon,
  Loader2,
  Play,
  Users,
  Target,
  Layers,
  Search
} from 'lucide-react';

interface OnboardingDashboardProps {
  onNavigate: (view: string) => void;
  onComplete: (data: { companyDomain: string; [key: string]: any }) => void;
  isDemo?: boolean;
}

export function OnboardingDashboard({ onNavigate, onComplete, isDemo = false }: OnboardingDashboardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyDomain: '',
    mainSequenceSetup: false,
    emailStagesSetup: false,
    prospectsSetup: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const extractDomainFromInput = (input: string): string => {
    // Remove protocol and www if present
    let domain = input.replace(/^https?:\/\//, '').replace(/^www\./, '');
    // Remove trailing slashes and paths
    domain = domain.split('/')[0];
    return domain;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDomainChange = (value: string) => {
    const cleanDomain = extractDomainFromInput(value);
    handleInputChange('companyDomain', cleanDomain);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      
      // Auto-complete steps 2-4 for demonstration
      if (currentStep === 1) {
        setTimeout(() => setFormData(prev => ({ ...prev, mainSequenceSetup: true })), 800);
      } else if (currentStep === 2) {
        setTimeout(() => setFormData(prev => ({ ...prev, emailStagesSetup: true })), 800);
      } else if (currentStep === 3) {
        setTimeout(() => setFormData(prev => ({ ...prev, prospectsSetup: true })), 800);
      }
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      onComplete(formData);
      setIsProcessing(false);
    }, 1500);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.companyDomain.length > 0;
      case 2: return formData.mainSequenceSetup;
      case 3: return formData.emailStagesSetup;
      case 4: return formData.prospectsSetup;
      default: return false;
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 4) * 100;
  };

  // Handle navigation clicks for demo mode
  const handleNavigationClick = (view: string) => {
    onNavigate(view);
  };

  if (isDemo) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300 font-medium">
              🎮 Demo Mode - Onboarding Preview
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                4-Step Onboarding Process
              </CardTitle>
              <CardDescription>
                This is how new users set up their accounts with our guided onboarding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">1</div>
                    <h4 className="font-medium text-blue-800">Company Domain</h4>
                  </div>
                  <p className="text-sm text-blue-700">Users enter their company domain for AI personalization</p>
                </Card>

                <Card 
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNavigationClick('main-sequence')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center text-sm font-semibold">2</div>
                    <h4 className="font-medium text-green-800">Main Sequence</h4>
                  </div>
                  <p className="text-sm text-green-700">Setup automated email sequences</p>
                  <div className="mt-2 text-xs text-green-600 font-medium">Click to visit →</div>
                </Card>

                <Card 
                  className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNavigationClick('email-stages')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center text-sm font-semibold">3</div>
                    <h4 className="font-medium text-yellow-800">Email Stages</h4>
                  </div>
                  <p className="text-sm text-yellow-700">Configure email templates for each stage</p>
                  <div className="mt-2 text-xs text-yellow-600 font-medium">Click to visit →</div>
                </Card>

                <Card 
                  className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNavigationClick('prospect-search')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center text-sm font-semibold">4</div>
                    <h4 className="font-medium text-purple-800">Prospects Setup</h4>
                  </div>
                  <p className="text-sm text-purple-700">Configure prospect import and management</p>
                  <div className="mt-2 text-xs text-purple-600 font-medium">Click to visit →</div>
                </Card>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">What this creates:</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div>✨ 5 default email stages with AI-generated content</div>
                  <div>📝 Personalized templates based on company domain</div>
                  <div>🎯 Automated prospect scoring and stage progression</div>
                  <div>🚀 Ready-to-use main sequence for immediate campaigns</div>
                </div>
              </div>
              
              <Button 
                onClick={() => onNavigate('cold')} 
                className="w-full"
              >
                Continue Demo Tour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-border/50 px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Toastify</h1>
            <p className="text-gray-600">
              Let's set up your account in 4 simple steps
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Step 1: Company Domain */}
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">Company Information</CardTitle>
                <CardDescription className="text-base">
                  Enter your company domain to enable AI-powered personalization
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyDomain">Company Website or Domain *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyDomain"
                      type="text"
                      placeholder="example.com or https://example.com"
                      value={formData.companyDomain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    We'll use this to generate personalized email templates and analyze your industry
                  </p>
                </div>

                {formData.companyDomain && (
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-800">AI Features Enabled</span>
                      </div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckIcon className="h-3 w-3 text-green-500" />
                          Auto-generate personalized email sequences
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckIcon className="h-3 w-3 text-green-500" />
                          Smart prospect demographic suggestions
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckIcon className="h-3 w-3 text-green-500" />
                          Industry-specific template optimization
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </>
          )}

          {/* Step 2: Main Sequence Setup */}
          {currentStep === 2 && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">Main Sequence Setup</CardTitle>
                <CardDescription className="text-base">
                  Setting up your automated email sequences
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Email Sequence Creation</span>
                    </div>
                    {formData.mainSequenceSetup ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Creating 5-step email sequence</p>
                    <p>• Configuring automated timing</p>
                    <p>• Setting up engagement tracking</p>
                  </div>
                </div>
                
                {formData.mainSequenceSetup && (
                  <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-800">Main Sequence Ready!</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Your automated email sequence is configured and ready to use.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </>
          )}

          {/* Step 3: Email Stages Setup */}
          {currentStep === 3 && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500">
                    <Layers className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">Email Stages Configuration</CardTitle>
                <CardDescription className="text-base">
                  Creating personalized email templates for each stage
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Email Template Generation</span>
                    </div>
                    {formData.emailStagesSetup ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Generating Cold prospects template</p>
                    <p>• Creating Warming prospects template</p>
                    <p>• Setting up Interested prospects template</p>
                    <p>• Configuring Hot Lead template</p>
                  </div>
                </div>
                
                {formData.emailStagesSetup && (
                  <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Email Stages Complete!</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        All email templates have been personalized for {formData.companyDomain}.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </>
          )}

          {/* Step 4: Prospects Setup */}
          {currentStep === 4 && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">Prospects Configuration</CardTitle>
                <CardDescription className="text-base">
                  Setting up prospect management and scoring system
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Prospect System Setup</span>
                    </div>
                    {formData.prospectsSetup ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Configuring prospect scoring system</p>
                    <p>• Setting up stage progression rules</p>
                    <p>• Initializing engagement tracking</p>
                    <p>• Preparing import system</p>
                  </div>
                </div>
                
                {formData.prospectsSetup && (
                  <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Prospects System Ready!</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Your prospect management system is configured and ready for imports.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {isProcessing && (
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Finalizing Setup...</p>
                          <p className="text-xs text-blue-600">Completing your Toastify configuration</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </>
          )}

          {/* Navigation Buttons */}
          <CardContent className="pt-6">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Back
                </Button>
              )}
              
              <Button 
                onClick={handleNextStep}
                disabled={!canProceed() || isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizing...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}