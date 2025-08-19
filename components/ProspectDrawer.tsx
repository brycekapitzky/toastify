import React, { useState } from "react";
import { X, Mail, Phone, ExternalLink, Calendar, User, Building2, MapPin, Clock, Star, MessageSquare, MousePointer, Eye, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  getStageLabel, 
  getStatusColor, 
  getEngagementScore, 
  formatCompanyInfo,
  formatLocation,
  formatLastContact,
  formatNextContact,
  getEngagementGroupColor,
  getEngagementGroupLabel 
} from '../utils/prospectUtils';
import type { EnhancedProspect } from "../types";

interface ProspectDrawerProps {
  prospect: EnhancedProspect;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<EnhancedProspect>) => void;
  onAddEngagement: (prospectId: string, event: any) => void;
  isDemo?: boolean;
}

export function ProspectDrawer({
  prospect,
  onClose,
  onUpdate,
  onAddEngagement,
  isDemo = false,
}: ProspectDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: prospect.name || '',
    email: prospect.email || '',
    company: prospect.company || '',
    title: prospect.title || '',
    phone: prospect.phone || '',
    linkedin_url: prospect.linkedin_url || '',
    website: prospect.website || '',
    notes: prospect.notes || '',
    city: prospect.city || '',
    state: prospect.state || '',
    country: prospect.country || '',
  });
  const [newEngagement, setNewEngagement] = useState({
    type: 'email_sent',
    description: '',
  });
  const [showAddEngagement, setShowAddEngagement] = useState(false);

  const engagementScore = getEngagementScore(prospect);
  const statusColor = getStatusColor(prospect.status);
  const engagementColor = getEngagementGroupColor(prospect.engagement_group || 0);

  const handleSave = () => {
    if (isDemo) {
      alert('Demo mode: Changes are not saved in demo mode');
      setIsEditing(false);
      return;
    }

    onUpdate(prospect.id, {
      ...editData,
      updated_at: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleAddEngagement = () => {
    if (isDemo) {
      alert('Demo mode: Engagement events are not saved in demo mode');
      setShowAddEngagement(false);
      return;
    }

    if (!newEngagement.description.trim()) {
      alert('Please enter a description for the engagement event');
      return;
    }

    onAddEngagement(prospect.id, {
      type: newEngagement.type,
      description: newEngagement.description,
      metadata: {},
    });

    setNewEngagement({ type: 'email_sent', description: '' });
    setShowAddEngagement(false);
  };

  const engagementEvents = [
    { type: 'email_sent', description: 'Initial outreach email sent', created_at: prospect.created_at },
    { type: 'email_opened', description: 'Email opened 3 times', created_at: prospect.updated_at },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Contact' : 'Contact Details'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatCompanyInfo(prospect)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Demo Mode Notice */}
          {isDemo && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Demo Mode:</strong> Changes will not be saved
              </AlertDescription>
            </Alert>
          )}

          {/* Status and Engagement Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge className={statusColor}>
                      {prospect.status}
                    </Badge>
                  </div>
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Engagement</p>
                    <Badge className={engagementColor}>
                      {getEngagementGroupLabel(prospect.engagement_group || 0)}
                    </Badge>
                  </div>
                  <Star className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Eye className="h-4 w-4 text-blue-500 mb-1" />
                  <span className="text-lg font-semibold">{prospect.opens || 0}</span>
                  <span className="text-xs text-gray-600">Opens</span>
                </div>
                <div className="flex flex-col items-center">
                  <MousePointer className="h-4 w-4 text-green-500 mb-1" />
                  <span className="text-lg font-semibold">{prospect.clicks || 0}</span>
                  <span className="text-xs text-gray-600">Clicks</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-4 w-4 text-purple-500 mb-1" />
                  <span className="text-lg font-semibold">{prospect.replies || 0}</span>
                  <span className="text-xs text-gray-600">Replies</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Score: {engagementScore.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={editData.company}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={editData.linkedin_url}
                        onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editData.website}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={editData.state}
                        onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={editData.country}
                        onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{prospect.email}</span>
                    </div>
                    
                    {prospect.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{prospect.phone}</span>
                      </div>
                    )}

                    {(prospect.city || prospect.state || prospect.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatLocation(prospect)}</span>
                      </div>
                    )}

                    {prospect.linkedin_url && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                        <a
                          href={prospect.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}

                    {prospect.website && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Company Website
                        </a>
                      </div>
                    )}
                  </div>

                  {prospect.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-sm text-gray-700">{prospect.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Activity Timeline</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddEngagement(!showAddEngagement)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {showAddEngagement && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <select
                      id="eventType"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      value={newEngagement.type}
                      onChange={(e) => setNewEngagement({ ...newEngagement, type: e.target.value })}
                    >
                      <option value="email_sent">Email Sent</option>
                      <option value="email_opened">Email Opened</option>
                      <option value="email_clicked">Email Clicked</option>
                      <option value="email_replied">Email Replied</option>
                      <option value="call_made">Call Made</option>
                      <option value="meeting_scheduled">Meeting Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="eventDescription">Description</Label>
                    <Input
                      id="eventDescription"
                      value={newEngagement.description}
                      onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                      placeholder="Enter event description..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddEngagement}>
                      Add Event
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddEngagement(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {engagementEvents.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.description}</p>
                      <p className="text-xs text-gray-600">
                        {formatLastContact({ ...prospect, last_contacted_at: event.created_at })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Last Contact:</span>
                    <div className="font-medium">{formatLastContact(prospect)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Contact:</span>
                    <div className="font-medium">{formatNextContact(prospect)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Stage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Email Sequence</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">
                    {getStageLabel(prospect.current_stage || 0)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Stage {prospect.current_stage || 0} of 5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}