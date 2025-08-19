import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Download, Filter, TrendingUp, Users, Mail, Target, BarChart3 } from 'lucide-react';
import { type Prospect } from './mockData';

interface ReportsDashboardProps {
  prospects: Prospect[];
}

export function ReportsDashboard({ prospects }: ReportsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Calculate email-focused KPIs
  const totalProspects = prospects.length;
  const activeProspects = prospects.filter(p => p.status === 'active').length;
  const handoffProspects = prospects.filter(p => p.group >= 5 || p.status === 'handoff').length;
  
  // Email KPIs
  const totalEmails = prospects.reduce((sum, p) => sum + (p.timeline?.filter(t => t.type === 'email_sent').length || 0), 0);
  const totalOpens = prospects.reduce((sum, p) => sum + p.opens, 0);
  const totalClicks = prospects.reduce((sum, p) => sum + p.clicks, 0);
  const totalReplies = prospects.reduce((sum, p) => sum + p.replies, 0);
  
  const openRate = totalEmails > 0 ? Math.round((totalOpens / totalEmails) * 100) : 0;
  const clickRate = totalEmails > 0 ? Math.round((totalClicks / totalEmails) * 100) : 0;
  const replyRate = totalEmails > 0 ? Math.round((totalReplies / totalEmails) * 100) : 0;
  
  // Group distribution data
  const groupData = [
    { group: 'Cold (0)', count: prospects.filter(p => p.group === 0 && p.status !== 'cold').length, color: '#8884d8' },
    { group: 'Warming (1-2)', count: prospects.filter(p => p.group >= 1 && p.group <= 2).length, color: '#82ca9d' },
    { group: 'Interested (3)', count: prospects.filter(p => p.group === 3).length, color: '#ffc658' },
    { group: 'Hot Lead (4)', count: prospects.filter(p => p.group === 4).length, color: '#ff7300' },
    { group: 'Very Hot (5)', count: prospects.filter(p => p.group === 5).length, color: '#ff4444' },
    { group: 'Hand-off (5+)', count: handoffProspects, color: '#8b5cf6' }
  ].filter(item => item.count > 0);

  // Email engagement timeline data
  const engagementData = [
    { date: 'Week 1', opens: 245, clicks: 42, replies: 13, sent: 320 },
    { date: 'Week 2', opens: 289, clicks: 58, replies: 21, sent: 380 },
    { date: 'Week 3', opens: 198, clicks: 35, replies: 17, sent: 290 },
    { date: 'Week 4', opens: 331, clicks: 72, replies: 24, sent: 420 },
    { date: 'Week 5', opens: 276, clicks: 49, replies: 19, sent: 350 },
    { date: 'Week 6', opens: 312, clicks: 68, replies: 28, sent: 410 },
    { date: 'Week 7', opens: 234, clicks: 41, replies: 16, sent: 310 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff4444', '#8b5cf6'];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-border/50 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Email Analytics & Reports</h1>
                <p className="text-sm text-gray-600">
                  Performance insights and data export for your outreach campaigns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Email KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Open Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{openRate}%</div>
                <p className="text-xs text-muted-foreground">{totalOpens} opens from {totalEmails} emails</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Click Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{clickRate}%</div>
                <p className="text-xs text-muted-foreground">{totalClicks} clicks from {totalEmails} emails</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Reply Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{replyRate}%</div>
                <p className="text-xs text-muted-foreground">{totalReplies} replies from {totalEmails} emails</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  Hand-offs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{handoffProspects}</div>
                <p className="text-xs text-muted-foreground">Sales-ready prospects</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prospect Distribution */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Prospect Stage Distribution</CardTitle>
                <CardDescription>
                  Current breakdown by engagement level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={groupData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ group, count }) => `${group}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {groupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Email Engagement Timeline */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Email Engagement Over Time</CardTitle>
                <CardDescription>
                  Weekly breakdown of email performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="opens" fill="#3b82f6" name="Opens" />
                      <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                      <Bar dataKey="replies" fill="#8b5cf6" name="Replies" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Performance */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Key metrics across all active sequences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Active Prospects</span>
                  <span className="text-lg font-bold text-blue-600">{activeProspects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Emails Sent</span>
                  <span className="text-lg font-bold text-green-600">{totalEmails}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Engagement Score Avg</span>
                  <span className="text-lg font-bold text-purple-600">
                    {totalProspects > 0 ? Math.round((totalOpens + totalClicks) / totalProspects * 10) / 10 : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-lg font-bold text-orange-600">
                    {totalProspects > 0 ? Math.round((handoffProspects / totalProspects) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Export Options - Now Scrollable */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                  Download prospect lists and analytics for external analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="justify-start hover:bg-blue-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Warming Prospects (1-2 Score)
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-green-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Interested Prospects (3 Score)
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-orange-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Hot Leads (4 Score)
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-purple-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Hand-off List (5+ Score)
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Full Analytics (CSV)
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-slate-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Campaign Summary
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-emerald-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Email Performance Report
                    </Button>
                    <Button variant="outline" className="justify-start hover:bg-cyan-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export Timeline Data
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Advanced filtering options:
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        By Date Range
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        By Stage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Best Performing Days</CardTitle>
                <CardDescription>Highest engagement by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tuesday</span>
                    <span className="text-sm font-semibold text-green-600">34% open rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Wednesday</span>
                    <span className="text-sm font-semibold text-blue-600">29% open rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Thursday</span>
                    <span className="text-sm font-semibold text-purple-600">26% open rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Top Subject Lines</CardTitle>
                <CardDescription>Highest performing email subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">"Quick question about {'{company}'}"</div>
                    <div className="text-muted-foreground">45% open rate</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">"Saw your recent LinkedIn post"</div>
                    <div className="text-muted-foreground">41% open rate</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">"5 min to discuss {'{industry}'} trends?"</div>
                    <div className="text-muted-foreground">38% open rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Industry Breakdown</CardTitle>
                <CardDescription>Prospects by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Technology</span>
                    <span className="text-sm font-semibold">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Healthcare</span>
                    <span className="text-sm font-semibold">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Finance</span>
                    <span className="text-sm font-semibold">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other</span>
                    <span className="text-sm font-semibold">17%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}