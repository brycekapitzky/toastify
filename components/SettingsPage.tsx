import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Save,
  Check,
  Plus,
  CheckCircle,
  AlertTriangle,
  Globe,
  Link,
  Copy
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SettingsPageProps {
  isDemo?: boolean;
  user: SupabaseUser;
  onMarkOnboardingComplete?: () => void;
  onResetOnboarding?: () => void;
}

export function SettingsPage({ isDemo = false, user, onMarkOnboardingComplete, onResetOnboarding }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Demo settings state
  const [settings, setSettings] = useState({
    profile: {
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || 'user@example.com',
      company: 'Your Company',
      role: 'Sales Manager',
      timezone: 'America/New_York',
      avatar: null
    },
    notifications: {
      emailReplies: true,
      dailyReports: true,
      weeklyReports: true,
      sequenceUpdates: false,
      prospectUpdates: true,
      systemUpdates: false
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 24
    },
    billing: {
      plan: isDemo ? 'Demo' : 'Professional',
      nextBilling: '2024-02-15',
      usage: {
        emailsSent: 1250,
        emailsLimit: 2500,
        prospects: 450,
        prospectsLimit: 1000
      }
    },
    tracking: {
      customDomain: 'track.yourcompany.com',
      defaultDomain: 'toastify.link',
      isCustomDomainEnabled: false,
      domainVerified: true,
      sslEnabled: true
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setSavedMessage('Settings saved successfully!');
    
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const userName = settings.profile.name;
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'tracking', label: 'Tracking', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'onboarding', label: 'Onboarding', icon: CheckCircle }
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-border/50 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-600">
                  Manage your account, preferences, and integrations
                </p>
              </div>
            </div>
            {savedMessage && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">{savedMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-border bg-gray-50/50 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile Information</h2>
                  <p className="text-sm text-gray-600">Update your personal information and profile details.</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                          <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                          Change Photo
                        </Button>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={settings.profile.name}
                            onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={settings.profile.email}
                            onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                            disabled={isDemo}
                          />
                          {isDemo && (
                            <p className="text-xs text-gray-500">Email changes disabled in demo mode</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={settings.profile.company}
                            onChange={(e) => updateSetting('profile', 'company', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            value={settings.profile.role}
                            onChange={(e) => updateSetting('profile', 'role', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select value={settings.profile.timezone} onValueChange={(value) => updateSetting('profile', 'timezone', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                              <SelectItem value="Europe/London">London (GMT)</SelectItem>
                              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Notification Preferences</h2>
                  <p className="text-sm text-gray-600">Choose what notifications you'd like to receive.</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    {Object.entries({
                      emailReplies: { label: 'Email Replies', description: 'Get notified when prospects reply to your emails' },
                      dailyReports: { label: 'Daily Reports', description: 'Daily summary of your email campaign performance' },
                      weeklyReports: { label: 'Weekly Reports', description: 'Weekly insights and analytics reports' },
                      sequenceUpdates: { label: 'Sequence Updates', description: 'Notifications about sequence completions and updates' },
                      prospectUpdates: { label: 'Prospect Updates', description: 'Updates when prospects change stages or status' },
                      systemUpdates: { label: 'System Updates', description: 'Important system announcements and feature updates' }
                    }).map(([key, config]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label>{config.label}</Label>
                          <p className="text-sm text-gray-500">{config.description}</p>
                        </div>
                        <Switch
                          checked={settings.notifications[key as keyof typeof settings.notifications]}
                          onCheckedChange={(checked) => updateSetting('notifications', key, checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Security & Privacy</h2>
                  <p className="text-sm text-gray-600">Manage your account security and privacy settings.</p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Password & Authentication</CardTitle>
                      <CardDescription>Manage your account password and security options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                          disabled={isDemo}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Login Notifications</Label>
                          <p className="text-sm text-gray-500">Get notified when someone signs into your account</p>
                        </div>
                        <Switch
                          checked={settings.security.loginNotifications}
                          onCheckedChange={(checked) => updateSetting('security', 'loginNotifications', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                        <Select value={settings.security.sessionTimeout.toString()} onValueChange={(value) => updateSetting('security', 'sessionTimeout', Number(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="4">4 hours</SelectItem>
                            <SelectItem value="8">8 hours</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="168">1 week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {!isDemo && (
                        <div className="pt-4 border-t">
                          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Change Password
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Data & Privacy</CardTitle>
                      <CardDescription>Control how your data is used and stored</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Data Retention Policy</span>
                          <Badge variant="outline">90 days</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Last Data Export</span>
                          <span className="text-gray-500">Never</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t space-y-2">
                        <Button variant="outline" size="sm">
                          Export My Data
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tracking Settings */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Tracking Domain</h2>
                  <p className="text-sm text-gray-600">Configure a custom tracking domain for your email links and tracking pixels.</p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Tracking Domain</CardTitle>
                      <CardDescription>
                        {settings.tracking.isCustomDomainEnabled 
                          ? 'You are currently using a custom tracking domain'
                          : 'You are currently using the default Toastify tracking domain'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-mono text-sm font-medium">
                              {settings.tracking.isCustomDomainEnabled 
                                ? settings.tracking.customDomain 
                                : settings.tracking.defaultDomain
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {settings.tracking.isCustomDomainEnabled ? 'Custom Domain' : 'Default Domain'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {settings.tracking.isCustomDomainEnabled && settings.tracking.domainVerified && (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {settings.tracking.sslEnabled && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                              SSL Enabled
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              settings.tracking.isCustomDomainEnabled 
                                ? settings.tracking.customDomain 
                                : settings.tracking.defaultDomain
                            )}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Custom Tracking Domain</CardTitle>
                      <CardDescription>
                        Use your own domain for email tracking to improve deliverability and maintain brand consistency
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Custom Tracking Domain</Label>
                          <p className="text-sm text-gray-500">Use your own domain instead of the default Toastify domain</p>
                        </div>
                        <Switch
                          checked={settings.tracking.isCustomDomainEnabled}
                          onCheckedChange={(checked) => updateSetting('tracking', 'isCustomDomainEnabled', checked)}
                          disabled={isDemo}
                        />
                      </div>

                      {settings.tracking.isCustomDomainEnabled && (
                        <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                          <div className="space-y-2">
                            <Label htmlFor="customDomain">Custom Domain</Label>
                            <Input
                              id="customDomain"
                              value={settings.tracking.customDomain}
                              onChange={(e) => updateSetting('tracking', 'customDomain', e.target.value)}
                              placeholder="track.yourcompany.com"
                              disabled={isDemo}
                            />
                            <p className="text-xs text-blue-600">
                              Enter a subdomain you own (e.g., track.yourcompany.com, links.yourcompany.com)
                            </p>
                          </div>

                          {!isDemo && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  Verify Domain
                                </Button>
                                <Button size="sm" variant="outline">
                                  Test Configuration
                                </Button>
                              </div>
                              
                              <Alert>
                                <Link className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  <strong>DNS Configuration Required:</strong><br />
                                  Add a CNAME record pointing your custom domain to: <code className="bg-white px-1 py-0.5 rounded">tracking.toastify.com</code>
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}

                          {isDemo && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Custom tracking domain setup is not available in demo mode. Sign up for a real account to configure your own tracking domain.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Benefits of Custom Tracking Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Improved Deliverability:</span> Email providers trust links from your own domain more than generic tracking domains
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Brand Consistency:</span> All tracking links will use your company's domain
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Better Analytics:</span> Domain reputation builds over time, improving long-term performance
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Compliance Ready:</span> Helps meet enterprise security and compliance requirements
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Team Settings */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Team Management</h2>
                  <p className="text-sm text-gray-600">Manage team members and collaboration settings.</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <CardDescription>Invite and manage your team members</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isDemo ? (
                      <Alert>
                        <Users className="h-4 w-4" />
                        <AlertDescription>
                          Team management features are not available in demo mode. Upgrade to a paid plan to collaborate with team members.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-sm bg-blue-500 text-white">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{settings.profile.name}</div>
                              <div className="text-xs text-gray-500">{settings.profile.email}</div>
                            </div>
                          </div>
                          <Badge variant="outline">Owner</Badge>
                        </div>
                        
                        <div className="border-t pt-4">
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Invite Team Member
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Billing & Usage</h2>
                  <p className="text-sm text-gray-600">Manage your subscription and view usage statistics.</p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Current Plan</CardTitle>
                          <CardDescription>Your active subscription plan</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
                          {settings.billing.plan}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!isDemo && (
                        <div className="flex gap-3">
                          <Button variant="outline">Change Plan</Button>
                          <Button variant="outline">View Invoices</Button>
                        </div>
                      )}
                      {isDemo && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Billing features are not available in demo mode. Sign up for a real account to manage your subscription.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Usage Statistics</CardTitle>
                      <CardDescription>Your current usage for this billing period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Emails Sent</span>
                          <span>{settings.billing.usage.emailsSent} / {settings.billing.usage.emailsLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" 
                            style={{ width: `${(settings.billing.usage.emailsSent / settings.billing.usage.emailsLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Active Prospects</span>
                          <span>{settings.billing.usage.prospects} / {settings.billing.usage.prospectsLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                            style={{ width: `${(settings.billing.usage.prospects / settings.billing.usage.prospectsLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Onboarding */}
            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Onboarding Status</h2>
                  <p className="text-sm text-gray-600">Manage your onboarding progress and preferences.</p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Onboarding Completion</CardTitle>
                      <CardDescription>Mark your onboarding as complete to hide it from the sidebar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          If you've completed the onboarding steps and want to hide the onboarding section from your sidebar, 
                          you can mark it as complete below.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={onMarkOnboardingComplete}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          disabled={isDemo}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Onboarding Complete
                        </Button>
                        {isDemo && (
                          <p className="text-sm text-gray-500">Not available in demo mode</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Reset Onboarding</CardTitle>
                      <CardDescription>Access the onboarding flow again or reset your progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          If you need to access the onboarding section again (perhaps to review the setup steps or 
                          reconfigure your account), you can reset your onboarding status below. This will make the 
                          onboarding section appear in your sidebar again.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={onResetOnboarding}
                          variant="outline"
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          disabled={isDemo}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Reset Onboarding Status
                        </Button>
                        {isDemo && (
                          <p className="text-sm text-gray-500">Not available in demo mode</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}