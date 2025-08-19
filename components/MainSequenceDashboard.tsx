import React, { useState, useEffect } from 'react';
import { Play, Pause, Users, Mail, TrendingUp, Clock, Target, Eye, MousePointer, MessageSquare, Check, Edit, Copy, FileText, Settings, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import type { Prospect } from './mockData';

interface MainSequenceDashboardProps {
  prospects: Prospect[];
  onToggleSequence?: () => void;
  sequenceStatus?: string;
}

export function MainSequenceDashboard({ prospects, onToggleSequence, sequenceStatus = 'paused' }: MainSequenceDashboardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('edit');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedTemplate, setEditedTemplate] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editingStepName, setEditingStepName] = useState('');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  // Sample data for preview
  const previewData = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'TechCorp Inc.',
    senderName: 'Alex Thompson'
  };

  // Calculate sequence statistics
  const totalProspects = prospects.length;
  const activeProspects = prospects.filter(p => p.status !== 'bounced' && p.status !== 'handoff').length;
  const completedProspects = prospects.filter(p => p.status === 'handoff').length;
  
  // Calculate engagement metrics
  const totalSent = prospects.reduce((sum, p) => sum + (p.opens > 0 ? 1 : 0), 0);
  const totalOpens = prospects.reduce((sum, p) => sum + p.opens, 0);
  const totalClicks = prospects.reduce((sum, p) => sum + p.clicks, 0);
  const totalReplies = prospects.reduce((sum, p) => sum + p.replies, 0);

  // Main sequence steps with actual content
  const [sequenceSteps, setSequenceSteps] = useState([
    {
      id: 1,
      name: 'Initial Outreach',
      delay: 'Immediate',
      subject: 'Quick question about {{company}}',
      template: `Hi {{firstName}},

I hope this email finds you well. I came across {{company}} and was impressed by your work in the industry.

I wanted to reach out because I believe there might be a valuable opportunity for us to connect. We specialize in helping companies like {{company}} streamline their operations and increase efficiency.

Would you be open to a brief conversation to explore how we might be able to help {{company}} achieve its goals?

Best regards,
{{senderName}}`,
      stats: { sent: totalSent, opens: 342, clicks: 89, replies: 23 }
    },
    {
      id: 2,
      name: 'Follow-up',
      delay: 'Day 4',
      subject: 'Following up on my previous email',
      template: `Hi {{firstName}},

I wanted to follow up on my previous email about {{company}}. I understand you're busy, but I believe this could be valuable for your business.

I'd love to show you how we've helped similar companies in your industry achieve:
• 35% increase in operational efficiency
• 20% reduction in overhead costs
• Faster time-to-market for new initiatives

Would you have 15 minutes this week for a brief call?

Best regards,
{{senderName}}`,
      stats: { sent: 987, opens: 298, clicks: 76, replies: 19 }
    },
    {
      id: 3,
      name: 'Value Proposition',
      delay: 'Day 9',
      subject: 'Custom solution for {{company}}',
      template: `Hi {{firstName}},

I hope you're doing well. I've been thinking about {{company}} and wanted to share something that might be relevant to your current challenges.

Based on what I know about your industry, I've put together a brief overview of how we could help {{company}}:

✓ Streamlined processes that save time
✓ Scalable solutions that grow with your business
✓ Proven ROI from similar implementations

I'd be happy to customize this further based on {{company}}'s specific needs. When would be a good time for a 15-minute conversation?

Looking forward to connecting,
{{senderName}}`,
      stats: { sent: 756, opens: 267, clicks: 91, replies: 34 }
    },
    {
      id: 4,
      name: 'Social Proof',
      delay: 'Day 15',
      subject: 'How [Similar Company] achieved 40% growth',
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
      stats: { sent: 623, opens: 234, clicks: 87, replies: 41 }
    },
    {
      id: 5,
      name: 'Final Attempt',
      delay: 'Day 21',
      subject: 'One last attempt - {{company}}',
      template: `Hi {{firstName}},

This will be my last email, as I don't want to overwhelm your inbox.

I genuinely believe our solution could make a significant impact at {{company}}, but I understand timing isn't always right.

If you'd ever like to explore how we could help {{company}} achieve its goals more efficiently, I'm just an email away.

I wish you and {{company}} continued success.

Best regards,
{{senderName}}

P.S. If you'd prefer not to receive future emails from me, just reply with "remove" and I'll respect that request immediately.`,
      stats: { sent: 487, opens: 178, clicks: 52, replies: 31 }
    }
  ]);

  const selectedStep = sequenceSteps[selectedStepIndex];

  // Initialize form data when step changes
  useEffect(() => {
    if (selectedStep) {
      setEditedSubject(selectedStep.subject);
      setEditedTemplate(selectedStep.template);
      setHasChanges(false);
    }
  }, [selectedStepIndex, selectedStep]);

  // Handle sequence activation/deactivation
  const handleToggleSequence = async () => {
    if (onToggleSequence && !isToggling) {
      setIsToggling(true);
      setShowStatusMessage(false);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        onToggleSequence();
        
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
    setHasChanges(value !== selectedStep.subject || editedTemplate !== selectedStep.template);
  };

  const handleTemplateChange = (value: string) => {
    setEditedTemplate(value);
    setHasChanges(editedSubject !== selectedStep.subject || value !== selectedStep.template);
  };

  // Auto-save functionality
  const handleSave = async () => {
    setIsSaving(true);
    
    // Update the step in the local state
    setSequenceSteps(prev => prev.map((step, index) => 
      index === selectedStepIndex 
        ? { ...step, subject: editedSubject, template: editedTemplate }
        : step
    ));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setHasChanges(false);
    setLastSaved(new Date());
    
    // Clear saved message after 3 seconds
    setTimeout(() => setLastSaved(null), 3000);
  };

  // Handle step name editing
  const handleStepNameDoubleClick = (stepId: number, currentName: string) => {
    setEditingStepId(stepId);
    setEditingStepName(currentName);
  };

  const handleStepNameSave = () => {
    if (editingStepId !== null && editingStepName.trim()) {
      setSequenceSteps(prev => prev.map(step => 
        step.id === editingStepId 
          ? { ...step, name: editingStepName.trim() }
          : step
      ));
    }
    setEditingStepId(null);
    setEditingStepName('');
  };

  const handleStepNameCancel = () => {
    setEditingStepId(null);
    setEditingStepName('');
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
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">Main Sequence</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">5-stage sequence • 21 days • {activeProspects} active</span>
                  {sequenceStatus === 'activated' ? (
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
                onClick={handleToggleSequence}
                disabled={isToggling}
                className={`font-medium transition-all duration-300 shadow-lg ${
                  showStatusMessage
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                    : sequenceStatus === 'activated'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-primary to-slate-700 hover:from-primary/90 hover:to-slate-800 text-primary-foreground'
                } ${isToggling ? 'scale-95' : 'scale-100'}`}
              >
                {isToggling ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                    {sequenceStatus === 'activated' ? 'Pausing...' : 'Starting...'}
                  </>
                ) : showStatusMessage ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {sequenceStatus === 'activated' ? 'Sequence Active!' : 'Sequence Paused!'}
                  </>
                ) : sequenceStatus === 'activated' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Sequence
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Sequence
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Compact KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Sent', value: totalSent, color: 'text-blue-600' },
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
              <h3 className="font-semibold text-foreground">Sequence Steps</h3>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary to-slate-700 text-primary-foreground border-0 font-medium px-2 py-1 text-xs">
                21 Days
              </Badge>
            </div>
          </div>

          {/* Scrollable Steps List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {sequenceSteps.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepIndex(index)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                    selectedStepIndex === index 
                      ? 'bg-primary/10 border-2 border-primary/20 shadow-lg ring-1 ring-primary/10' 
                      : 'bg-muted/40 border-2 border-transparent hover:bg-muted/60 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Step Number Circle */}
                    <div 
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                        selectedStepIndex === index 
                          ? 'bg-gradient-to-r from-primary to-slate-700 text-primary-foreground shadow-lg' 
                          : 'bg-muted-foreground/20 text-muted-foreground group-hover:bg-muted-foreground/30'
                      }`}
                    >
                      {step.id}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      {editingStepId === step.id ? (
                        <Input
                          value={editingStepName}
                          onChange={(e) => setEditingStepName(e.target.value)}
                          onBlur={handleStepNameSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStepNameSave();
                            if (e.key === 'Escape') handleStepNameCancel();
                          }}
                          className="h-6 text-sm font-semibold border-primary/30 focus:border-primary bg-card"
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className="cursor-pointer hover:text-primary transition-colors font-semibold text-foreground leading-tight text-sm"
                          onDoubleClick={() => handleStepNameDoubleClick(step.id, step.name)}
                          title="Double-click to edit"
                        >
                          {step.name}
                        </h4>
                      )}
                      
                      {/* Timing Text */}
                      <p className="mt-0.5 text-muted-foreground font-medium text-xs">
                        {step.delay}
                      </p>
                    </div>
                  </div>
                  
                  {/* Metrics Row - 4 columns */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="font-semibold text-foreground leading-tight text-sm">
                        {step.stats.sent}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Sent
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-emerald-600 leading-tight text-sm">
                        {step.stats.opens}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Opens
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600 leading-tight text-sm">
                        {step.stats.clicks}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Clicks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600 leading-tight text-sm">
                        {step.stats.replies}
                      </div>
                      <div className="text-muted-foreground font-medium text-xs">
                        Replies
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
          {/* Step Header with Tabs */}
          <div className="p-6 border-b border-border/60 bg-card flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">{selectedStep.name}</h2>
                {lastSaved && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse">
                    <Check className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Step {selectedStep.id} • {selectedStep.delay}
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
                Edit Email
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
                          setEditedSubject(selectedStep.subject);
                          setEditedTemplate(selectedStep.template);
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
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-6">
                  {/* Email Editor - 3 columns */}
                  <div className="col-span-3 space-y-6">
                    <div className="space-y-3">
                      <Label className="font-semibold text-foreground">Subject Line</Label>
                      <Input
                        value={editedSubject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        placeholder="Enter email subject..."
                        className="border-border/60 focus:border-primary focus:ring-primary/20 bg-card h-12 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="font-semibold text-foreground">Email Content</Label>
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
                  <p className="text-emerald-700 font-medium">This shows how your email will look to recipients with actual data.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/40 rounded-xl border border-border/40">
                    <h4 className="font-semibold text-foreground mb-2">Subject: {getPreviewContent(selectedStep.subject)}</h4>
                  </div>
                  <div className="p-6 bg-card border border-border/40 rounded-xl shadow-sm">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed font-normal">
                      {getPreviewContent(selectedStep.template)}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h4 className="font-semibold text-primary mb-3">Preview Data</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Prospect:</span> <span className="text-foreground">{previewData.firstName} {previewData.lastName}</span></div>
                    <div><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{previewData.company}</span></div>
                    <div><span className="text-muted-foreground">Sender:</span> <span className="text-foreground">{previewData.senderName}</span></div>
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