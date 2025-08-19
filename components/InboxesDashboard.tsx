import React, { useState } from 'react';
import { Mail, Plus, CheckCircle, AlertCircle, Clock, Edit, User, FileSignature, Check, X, Unlink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface InboxesDashboardProps {
  onNavigateToBilling?: () => void;
}

export function InboxesDashboard({ onNavigateToBilling }: InboxesDashboardProps) {
  const [editingInbox, setEditingInbox] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showOptOutDialog, setShowOptOutDialog] = useState(false);
  const [selectedInboxForSignature, setSelectedInboxForSignature] = useState<string | null>(null);
  const [selectedInboxForOptOut, setSelectedInboxForOptOut] = useState<string | null>(null);

  const [inboxes, setInboxes] = useState([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      status: 'active',
      dailyLimit: 50,
      sent: 23,
      warmupStatus: 'complete',
      reputation: 95,
      signature: `Best regards,\nSarah Johnson\nSales Director\nYour Company\n📧 sarah.johnson@company.com\n📱 (555) 123-4567`,
      optOutText: `If you'd prefer not to receive future emails from me, please reply with "UNSUBSCRIBE" and I'll remove you from our list immediately.\n\nThis email was sent by Your Company. If you have any questions, please contact us at support@yourcompany.com.`
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@company.com',
      status: 'active',
      dailyLimit: 30,
      sent: 18,
      warmupStatus: 'warming',
      reputation: 87,
      signature: `Best regards,\nMichael Chen\nAccount Executive\nYour Company\n📧 michael.chen@company.com`,
      optOutText: `If you'd prefer not to receive future emails, please reply with "REMOVE" and we'll respect your request immediately.`
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@company.com',
      status: 'paused',
      dailyLimit: 20,
      sent: 0,
      warmupStatus: 'pending',
      reputation: 92,
      signature: `Best regards,\nEmily Rodriguez\nBusiness Development\nYour Company\n📧 emily.rodriguez@company.com`,
      optOutText: `To unsubscribe from future communications, simply reply with "STOP" and I'll remove you immediately.`
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@company.com',
      status: 'active',
      dailyLimit: 40,
      sent: 15,
      warmupStatus: 'complete',
      reputation: 98,
      signature: `Best regards,\nDavid Kim\nSenior Sales Rep\nYour Company\n📧 david.kim@company.com\n📱 (555) 987-6543`,
      optOutText: `If you no longer wish to receive emails from us, please reply with "UNSUBSCRIBE" and we'll honor your request within 24 hours.`
    },
    {
      id: '5',
      firstName: 'Jennifer',
      lastName: 'Williams',
      email: 'jennifer.williams@company.com',
      status: 'active',
      dailyLimit: 35,
      sent: 12,
      warmupStatus: 'complete',
      reputation: 91,
      signature: `Best regards,\nJennifer Williams\nOutreach Specialist\nYour Company\n📧 jennifer.williams@company.com`,
      optOutText: `To opt out of future emails, please respond with "REMOVE" and I'll take care of it right away.`
    },
    {
      id: '6',
      firstName: 'Robert',
      lastName: 'Martinez',
      email: 'robert.martinez@company.com',
      status: 'warming',
      dailyLimit: 25,
      sent: 5,
      warmupStatus: 'warming',
      reputation: 89,
      signature: `Best regards,\nRobert Martinez\nSales Associate\nYour Company\n📧 robert.martinez@company.com`,
      optOutText: `If you'd like to unsubscribe from our emails, just reply "STOP" and we'll remove you immediately.`
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'warming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWarmupIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warming': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const updateInbox = (id: string, field: string, value: string) => {
    setInboxes(prev => prev.map(inbox => 
      inbox.id === id ? { ...inbox, [field]: value } : inbox
    ));
  };

  const handleSignatureEdit = (inboxId: string) => {
    setSelectedInboxForSignature(inboxId);
    setShowSignatureDialog(true);
  };

  const handleOptOutEdit = (inboxId: string) => {
    setSelectedInboxForOptOut(inboxId);
    setShowOptOutDialog(true);
  };

  const handleSignatureSave = (newSignature: string) => {
    if (selectedInboxForSignature) {
      updateInbox(selectedInboxForSignature, 'signature', newSignature);
      setShowSignatureDialog(false);
      setSelectedInboxForSignature(null);
    }
  };

  const handleOptOutSave = (newOptOutText: string) => {
    if (selectedInboxForOptOut) {
      updateInbox(selectedInboxForOptOut, 'optOutText', newOptOutText);
      setShowOptOutDialog(false);
      setSelectedInboxForOptOut(null);
    }
  };

  const handleAddInboxClick = () => {
    // Navigate to billing page in settings instead of showing add dialog
    if (onNavigateToBilling) {
      onNavigateToBilling();
    }
  };

  const EditableField = ({ value, onSave, placeholder, type = "text", disabled = false }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
      onSave(editValue);
      setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setEditValue(value);
        setIsEditing(false);
      }
    };

    if (disabled) {
      return (
        <div className="p-1 rounded">
          <span className="text-sm font-medium text-gray-700">{value}</span>
        </div>
      );
    }

    if (isEditing) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          type={type}
          className="text-sm"
          autoFocus
        />
      );
    }

    return (
      <div 
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
      >
        <span className="text-sm font-medium">{value}</span>
        <Edit className="h-3 w-3 ml-1 text-gray-400 inline" />
      </div>
    );
  };

  const SignatureDialog = () => {
    const [signatureText, setSignatureText] = useState(
      selectedInboxForSignature 
        ? inboxes.find(inbox => inbox.id === selectedInboxForSignature)?.signature || ''
        : ''
    );

    const selectedInbox = selectedInboxForSignature 
      ? inboxes.find(inbox => inbox.id === selectedInboxForSignature)
      : null;

    return (
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileSignature className="h-5 w-5 text-blue-600" />
              </div>
              Email Signature
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 leading-relaxed">
              {selectedInbox && (
                <span className="font-medium text-gray-800">
                  {selectedInbox.firstName} {selectedInbox.lastName} ({selectedInbox.email})
                </span>
              )}
              <br />
              Customize the email signature that will be automatically added to all outgoing emails from this inbox.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label htmlFor="signature" className="text-base font-medium text-gray-800">
                Email Signature
              </Label>
              <Textarea
                id="signature"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder={`Best regards,
Your Name
Your Title
Your Company
📧 your.email@company.com
📱 (555) 123-4567`}
                rows={10}
                className="resize-none text-base leading-relaxed font-sans border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <p className="text-sm text-gray-500">
                Use line breaks to format your signature. Emojis and special characters are supported.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-800">Live Preview</h4>
              </div>
              <div className="p-4 bg-white min-h-[120px]">
                {signatureText ? (
                  <pre className="text-base text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {signatureText}
                  </pre>
                ) : (
                  <p className="text-gray-400 italic">Your signature preview will appear here...</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => handleSignatureSave(signatureText)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-2.5"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Signature
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSignatureDialog(false)}
                className="px-6 font-medium border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const OptOutDialog = () => {
    const [optOutText, setOptOutText] = useState(
      selectedInboxForOptOut 
        ? inboxes.find(inbox => inbox.id === selectedInboxForOptOut)?.optOutText || ''
        : ''
    );

    const selectedInbox = selectedInboxForOptOut 
      ? inboxes.find(inbox => inbox.id === selectedInboxForOptOut)
      : null;

    return (
      <Dialog open={showOptOutDialog} onOpenChange={setShowOptOutDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 rounded-lg bg-red-100">
                <Unlink className="h-5 w-5 text-red-600" />
              </div>
              Opt Out Text
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 leading-relaxed">
              {selectedInbox && (
                <span className="font-medium text-gray-800">
                  {selectedInbox.firstName} {selectedInbox.lastName} ({selectedInbox.email})
                </span>
              )}
              <br />
              This text will be automatically added to all outgoing emails to provide recipients with an easy way to unsubscribe.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label htmlFor="optOutText" className="text-base font-medium text-gray-800">
                Opt Out Text
              </Label>
              <Textarea
                id="optOutText"
                value={optOutText}
                onChange={(e) => setOptOutText(e.target.value)}
                placeholder={`If you'd prefer not to receive future emails from me, please reply with "UNSUBSCRIBE" and I'll remove you from our list immediately.

This email was sent by Your Company. If you have any questions, please contact us at support@yourcompany.com.`}
                rows={8}
                className="resize-none text-base leading-relaxed font-sans border-gray-300 focus:border-red-500 focus:ring-red-500/20"
              />
              <p className="text-sm text-gray-500">
                This text helps maintain compliance with email regulations and provides clear opt-out instructions.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-800">Live Preview</h4>
              </div>
              <div className="p-4 bg-white min-h-[120px]">
                {optOutText ? (
                  <pre className="text-base text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {optOutText}
                  </pre>
                ) : (
                  <p className="text-gray-400 italic">Your opt-out text preview will appear here...</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => handleOptOutSave(optOutText)}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-2.5"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Opt Out Text
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowOptOutDialog(false)}
                className="px-6 font-medium border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-border/50 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Inboxes</h1>
                <p className="text-sm text-gray-600">
                  Manage your email accounts and sending limits
                </p>
              </div>
            </div>
            <Button 
              onClick={handleAddInboxClick}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inbox for $19/mo
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="space-y-4">
            {inboxes.map((inbox) => (
              <Card key={inbox.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left section - User info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {inbox.firstName[0]}{inbox.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <EditableField
                            value={`${inbox.firstName} ${inbox.lastName}`}
                            onSave={(value: string) => {
                              const [firstName, ...lastNameParts] = value.split(' ');
                              const lastName = lastNameParts.join(' ');
                              updateInbox(inbox.id, 'firstName', firstName);
                              updateInbox(inbox.id, 'lastName', lastName);
                            }}
                            placeholder="First Last"
                            disabled={true} // Prevent editing names
                          />
                          <Badge className={getStatusColor(inbox.status)}>
                            {inbox.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <EditableField
                            value={inbox.email}
                            onSave={(value: string) => updateInbox(inbox.id, 'email', value)}
                            placeholder="email@company.com"
                            type="email"
                            disabled={true} // Prevent editing email addresses
                          />
                        </div>
                      </div>
                    </div>

                    {/* Middle section - Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Daily Sending</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {inbox.sent} / {inbox.dailyLimit}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(inbox.sent / inbox.dailyLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Warmup Status</div>
                        <div className="flex items-center justify-center gap-2">
                          {getWarmupIcon(inbox.warmupStatus)}
                          <span className="text-sm font-medium capitalize">
                            {inbox.warmupStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Reputation</div>
                        <div className="text-lg font-semibold text-green-600">
                          {inbox.reputation}%
                        </div>
                      </div>
                    </div>

                    {/* Right section - Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSignatureEdit(inbox.id)}
                      >
                        <FileSignature className="h-4 w-4 mr-1" />
                        Signature
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOptOutEdit(inbox.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Opt Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Editor Dialog */}
      <SignatureDialog />
      
      {/* Opt Out Editor Dialog */}
      <OptOutDialog />
    </div>
  );
}