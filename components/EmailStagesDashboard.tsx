import React, { useState, useEffect } from 'react';
import { Layers, Users, Target, TrendingUp, Eye, MousePointer, MessageSquare, Check, Edit, Copy, FileText, Settings, Save, X, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface EmailStagesDashboardProps {
  onToggleStages?: () => void;
  stagesStatus?: string;
}

export function EmailStagesDashboard({ onToggleStages, stagesStatus = 'paused' }: EmailStagesDashboardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('edit');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedTemplate, setEditedTemplate] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  // Sample data for preview
  const previewData = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'TechCorp Inc.',
    senderName: 'Alex Thompson'
  };

  // Email stage templates for different prospect engagement levels
  const [emailStages, setEmailStages] = useState([
    {
      id: 'cold-prospects',
      name: 'Cold Prospects',
      engagementLevel: 'No engagement (0 score)',
      category: 'Initial Outreach',
      subject: 'Quick question about {{company}}',
      template: `Hi {{firstName}},

I hope this email finds you well. I came across {{company}} and was impressed by your work in the industry.

I wanted to reach out because I believe there might be a valuable opportunity for us to connect. We specialize in helping companies like {{company}} streamline their operations and increase efficiency.

Would you be open to a brief conversation to explore how we might be able to help {{company}} achieve its goals?

Best regards,
{{senderName}}`,
      stats: { prospects: 1248, sent: 892, opens: 234, clicks: 89, replies: 23, conversionRate: 7 }
    },
    {
      id: 'warming-prospects',
      name: 'Warming Prospects',
      engagementLevel: 'Low engagement (1-2 score)',
      category: 'Follow-up',
      subject: 'Following up on our conversation about {{company}}',
      template: `Hi {{firstName}},

Thanks for opening my previous email about {{company}}. I can see you're interested in learning more about how we can help.

I wanted to share a quick case study that might be relevant to your situation. We recently helped [Similar Company] achieve:

• 35% increase in operational efficiency
• 20% reduction in overhead costs  
• Faster time-to-market for new initiatives

I'd love to show you exactly how we did this and discuss how it could apply to {{company}}.

Would you have 15 minutes this week for a brief call?

Best,
{{senderName}}`,
      stats: { prospects: 892, sent: 745, opens: 298, clicks: 127, replies: 45, conversionRate: 14 }
    },
    {
      id: 'interested-prospects',
      name: 'Interested Prospects',
      engagementLevel: 'Medium engagement (3-4 score)',
      category: 'Value Proposition',
      subject: 'Custom solution proposal for {{company}}',
      template: `Hi {{firstName}},

Thank you for your continued engagement and interest in our solution for {{company}}.

Based on our previous interactions and your specific needs, I've put together a customized proposal that addresses:

✓ Your current challenges with operational efficiency
✓ Scalable solutions that grow with {{company}}
✓ ROI projections based on similar implementations

I've also included some additional resources:
• Industry benchmark report
• Implementation timeline
• Success stories from similar companies

When would be a good time to review this proposal together? I'm confident we can create significant value for {{company}}.

Looking forward to our discussion,
{{senderName}}`,
      stats: { prospects: 456, sent: 398, opens: 267, clicks: 156, replies: 89, conversionRate: 34 }
    },
    {
      id: 'hot-lead-prospects',
      name: 'Hot Lead Prospects',
      engagementLevel: 'High engagement (5-6 score)',
      category: 'Closing',
      subject: 'Next steps for {{company}} - Ready to move forward?',
      template: `Hi {{firstName}},

I hope you've had a chance to review the proposal I sent for {{company}}. Your engagement has been fantastic, and I can tell you're as excited about the possibilities as we are.

Given your level of interest and the value we can deliver, I'd like to discuss the next steps:

1. **Implementation Timeline**: We can start as early as next month
2. **Dedicated Support**: You'll have a dedicated success manager
3. **Special Pricing**: Available only for Q1 commitments

I have a few time slots available this week to finalize the details and get started. Which works better for you:
• Tuesday at 2 PM
• Wednesday at 10 AM  
• Thursday at 3 PM

Let's make this happen for {{company}}!

Best regards,
{{senderName}}`,
      stats: { prospects: 234, sent: 210, opens: 189, clicks: 127, replies: 78, conversionRate: 54 }
    },
    {
      id: 'handoff-prospects',
      name: 'Hand-off Prospects',
      engagementLevel: 'Very high engagement (7+ score)',
      category: 'Hand-off',
      subject: 'Personal introduction from our sales team',
      template: `Hi {{firstName}},

Thank you for your engagement with our outreach sequence. Based on your interest level and engagement, I'd like to personally introduce you to our senior sales consultant who can better assist with your specific needs.

They'll be reaching out within the next 24 hours to schedule a personalized consultation where we can:

• Provide a detailed demo tailored to {{company}}'s requirements
• Discuss custom pricing and implementation options
• Answer any technical questions you may have

Thank you for your time and interest. We're excited about the opportunity to work with {{company}}.

Best regards,
{{senderName}}`,
      stats: { prospects: 89, sent: 89, opens: 78, clicks: 67, replies: 52, conversionRate: 75 }
    }
  ]);

  const selectedStage = emailStages[selectedStageIndex];

  // Calculate overall statistics
  const totalProspects = emailStages.reduce((sum, stage) => sum + stage.stats.prospects, 0);
  const totalSent = emailStages.reduce((sum, stage) => sum + stage.stats.sent, 0);
  const totalOpens = emailStages.reduce((sum, stage) => sum + stage.stats.opens, 0);
  const totalClicks = emailStages.reduce((sum, stage) => sum + stage.stats.clicks, 0);
  const totalReplies = emailStages.reduce((sum, stage) => sum + stage.stats.replies, 0);

  // Initialize form data when stage changes
  useEffect(() => {
    if (selectedStage) {
      setEditedSubject(selectedStage.subject);
      setEditedTemplate(selectedStage.template);
      setHasChanges(false);
    }
  }, [selectedStageIndex, selectedStage]);

  // Handle stages activation/deactivation
  const handleToggleStages = async () => {
    if (onToggleStages && !isToggling) {
      setIsToggling(true);
      setShowStatusMessage(false);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        onToggleStages();
        
        setShowStatusMessage(true);
        setTimeout(() => setShowStatusMessage(false), 3000);
      } finally {
        setIsToggling(false);
      }
    }
  };

  // Handle form changes with auto-save indication
  const handleSubjectChange = (value: string) => {
    setEditedSubject(value);
    setHasChanges(value !== selectedStage.subject || editedTemplate !== selectedStage.template);
  };

  const handleTemplateChange = (value: string) => {
    setEditedTemplate(value);
    setHasChanges(editedSubject !== selectedStage.subject || value !== selectedStage.template);
  };

  // Auto-save functionality
  const handleSave = async () => {
    setIsSaving(true);
    
    // Update the stage in the local state
    setEmailStages(prev => prev.map((stage, index) => 
      index === selectedStageIndex 
        ? { ...stage, subject: editedSubject, template: editedTemplate }
        : stage
    ));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setHasChanges(false);
    setLastSaved(new Date());
    
    // Clear saved message after 3 seconds
    setTimeout(() => setLastSaved(null), 3000);
  };

  // Handle stage name editing
  const handleStageNameDoubleClick = (stageId: string, currentName: string) => {
    setEditingStageId(stageId);
    setEditingStageName(currentName);
  };

  const handleStageNameSave = () => {
    if (editingStageId !== null && editingStageName.trim()) {
      setEmailStages(prev => prev.map(stage => 
        stage.id === editingStageId 
          ? { ...stage, name: editingStageName.trim() }
          : stage
      ));
    }
    setEditingStageId(null);
    setEditingStageName('');
  };

  const handleStageNameCancel = () => {
    setEditingStageId(null);
    setEditingStageName('');
  };

  // Copy variable to clipboard
  const copyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      setCopiedVariable(variable);
      setTimeout(() => setCopiedVariable(null), 2000);
    } catch (error) {
      console.error('Failed to copy variable:', error);
    }
  };

  // Insert variable into template
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-template') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newTemplate = editedTemplate.substring(0, start) + variable + editedTemplate.substring(end);
      setEditedTemplate(newTemplate);
      setHasChanges(true);
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  // Replace variables with actual data for preview
  const getPreviewContent = (content: string) => {
    return content
      .replace(/\{\{firstName\}\}/g, previewData.firstName)
      .replace(/\{\{lastName\}\}/g, previewData.lastName)
      .replace(/\{\{company\}\}/g, previewData.company)
      .replace(/\{\{senderName\}\}/g, previewData.senderName);
  };

  const variables = [
    { var: '{{firstName}}', desc: 'First name', example: previewData.firstName },
    { var: '{{lastName}}', desc: 'Last name', example: previewData.lastName },
    { var: '{{company}}', desc: 'Company', example: previewData.company },
    { var: '{{senderName}}', desc: 'Your name', example: previewData.senderName }
  ];

  return (
    <div className="bg-background h-screen flex flex-col relative">
      {/* Compact Header */}
      <div className="bg-card border-b border-border/60 shadow-sm flex-shrink-0 relative z-20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-slate-700 shadow-lg ring-1 ring-black/5">
                <Layers className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">Email Stages</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">Smart templates • {emailStages.length} stages • Engagement-based</span>
                  {stagesStatus === 'activated' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Paused
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-border/60 hover:bg-accent/50 font-medium"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                onClick={handleToggleStages}
                disabled={isToggling}
                className={`font-medium transition-all duration-300 shadow-lg ${
                  showStatusMessage
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                    : stagesStatus === 'activated'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-primary to-slate-700 hover:from-primary/90 hover:to-slate-800 text-primary-foreground'
                } ${isToggling ? 'scale-95' : 'scale-100'}`}
              >
                {isToggling ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                    {stagesStatus === 'activated' ? 'Pausing...' : 'Starting...'}
                  </>
                ) : showStatusMessage ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {stagesStatus === 'activated' ? 'Stages Active!' : 'Stages Paused!'}
                  </>
                ) : stagesStatus === 'activated' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Stages
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate Stages
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Compact KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Prospects', value: totalProspects, color: 'text-blue-600' },
              { label: 'Opens', value: totalOpens, color: 'text-emerald-600' },
              { label: 'Clicks', value: totalClicks, color: 'text-orange-600' },
              { label: 'Replies', value: totalReplies, color: 'text-purple-600' }
            ].map((kpi) => (
              <div key={kpi.label} className="text-center">
                <div className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value.toLocaleString()}</div>
                <div className="text-muted-foreground font-medium">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area with Absolute Positioned Sidebar */}
      <div className="flex-1 relative">
        {/* Fixed Left Sidebar */}
        <div className="absolute top-0 left-0 w-80 h-full bg-card border-r border-border/60 shadow-sm flex flex-col z-10">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/60 bg-gradient-to-r from-muted/30 to-muted/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Email Templates</h3>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary to-slate-700 text-primary-foreground border-0 font-medium px-2 py-1 text-xs">
                5 Stages
              </Badge>
            </div>
          </div>

          {/* Scrollable Templates List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {emailStages.map((stage, index) => (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageIndex(index)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                    selectedStageIndex === index 
                      ? 'bg-primary/10 border-2 border-primary/20 shadow-lg ring-1 ring-primary/10' 
                      : 'bg-muted/40 border-2 border-transparent hover:bg-muted/60 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Stage Icon */}
                    <div 
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold transition-all duration-200 ${
                        selectedStageIndex === index 
                          ? 'bg-gradient-to-r from-primary to-slate-700 text-primary-foreground shadow-lg' 
                          : 'bg-muted-foreground/20 text-muted-foreground group-hover:bg-muted-foreground/30'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                    </div>
                    
                    {/* Stage Content */}
                    <div className="flex-1 min-w-0">
                      {editingStageId === stage.id ? (
                        <Input
                          value={editingStageName}
                          onChange={(e) => setEditingStageName(e.target.value)}
                          onBlur={handleStageNameSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStageNameSave();
                            if (e.key === 'Escape') handleStageNameCancel();
                          }}
                          className="h-6 text-sm font-semibold border-primary/30 focus:border-primary bg-card"
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className="cursor-pointer hover:text-primary transition-colors font-semibold text-foreground leading-tight text-sm"
                          onDoubleClick={() => handleStageNameDoubleClick(stage.id, stage.name)}
                          title="Double-click to edit"
                        >
                          {stage.name}
                        </h4>
                      )}
                      
                      {/* Engagement Level */}
                      <p className="mt-0.5 text-muted-foreground font-medium text-xs">
                        {stage.engagementLevel}
                      </p>
                      <p className="text-muted-foreground font-medium text-xs">
                        {stage.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Usage Stats - 4 columns */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="font-semibold text-foreground leading-tight text-sm">
                        {stage.stats.prospects}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Users
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-emerald-600 leading-tight text-sm">
                        {stage.stats.opens}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Opens
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600 leading-tight text-sm">
                        {stage.stats.clicks}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Clicks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600 leading-tight text-sm">
                        {stage.stats.conversionRate}%
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Convert
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content - Offset by sidebar width */}
        <div className="ml-80 h-full flex flex-col">
          {/* Stage Header with Tabs */}
          <div className="p-6 border-b border-border/60 bg-card flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">{selectedStage.name}</h2>
                {lastSaved && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse">
                    <Check className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedStage.category} • {selectedStage.engagementLevel}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-6 py-2 font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'edit'
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                Edit Template
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-2 font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'edit' ? (
              <div className="p-6">
                {/* Save Controls */}
                {hasChanges && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl shadow-sm mb-6">
                    <div className="flex items-center gap-3 text-orange-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">You have unsaved changes</span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditedSubject(selectedStage.subject);
                          setEditedTemplate(selectedStage.template);
                          setHasChanges(false);
                        }}
                        disabled={isSaving}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100 font-medium"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg font-medium"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-1">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save Template
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-6">
                  {/* Template Editor - 3 columns */}
                  <div className="col-span-3 space-y-6">
                    <div className="space-y-3">
                      <Label className="font-semibold text-foreground">Subject Line Template</Label>
                      <Input
                        value={editedSubject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        placeholder="Enter email subject template..."
                        className="border-border/60 focus:border-primary focus:ring-primary/20 bg-card h-12 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="font-semibold text-foreground">Email Template</Label>
                      <Textarea
                        id="email-template"
                        value={editedTemplate}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        rows={20}
                        placeholder="Enter your email template..."
                        className="resize-none leading-relaxed border-border/60 focus:border-primary focus:ring-primary/20 bg-card p-4 font-normal"
                      />
                    </div>
                  </div>

                  {/* Compact Variables Sidebar - 1 column */}
                  <div className="col-span-1">
                    <div className="sticky top-0">
                      <h4 className="font-semibold text-foreground mb-4">Variables</h4>
                      <div className="space-y-2">
                        {variables.map((item) => (
                          <div
                            key={item.var}
                            className="group p-3 bg-muted/40 border border-border/40 rounded-lg hover:bg-muted/60 transition-all duration-200 cursor-pointer"
                            onClick={() => insertVariable(item.var)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <code className="font-mono text-sm font-semibold text-primary">
                                {item.var}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyVariable(item.var);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded"
                                title="Copy to clipboard"
                              >
                                {copiedVariable === item.var ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-primary" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{item.desc}</p>
                            <p className="text-xs text-primary font-medium">Ex: {item.example}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200/60 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>Tip:</strong> Click to insert or copy variables for manual pasting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-4 shadow-sm">
                  <h4 className="font-semibold text-emerald-800 mb-2">Preview Mode</h4>
                  <p className="text-emerald-700 font-medium">This shows how your template will look when sent to prospects with actual data.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/40 rounded-xl border border-border/40">
                    <h4 className="font-semibold text-foreground mb-2">Subject: {getPreviewContent(selectedStage.subject)}</h4>
                  </div>
                  <div className="p-6 bg-card border border-border/40 rounded-xl shadow-sm">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed font-normal">
                      {getPreviewContent(selectedStage.template)}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h4 className="font-semibold text-primary mb-3">Template Usage</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Engagement Level:</span> <span className="text-foreground">{selectedStage.engagementLevel}</span></div>
                    <div><span className="text-muted-foreground">Category:</span> <span className="text-foreground">{selectedStage.category}</span></div>
                    <div><span className="text-muted-foreground">Used by:</span> <span className="text-foreground">{selectedStage.stats.prospects} prospects</span></div>
                    <div><span className="text-muted-foreground">Conversion Rate:</span> <span className="text-foreground">{selectedStage.stats.conversionRate}%</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}