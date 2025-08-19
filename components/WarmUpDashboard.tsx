import React from 'react';
import { TrendingUp, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface WarmUpAccount {
  id: string;
  email: string;
  status: 'warming' | 'ready' | 'paused' | 'issues';
  dailyLimit: number;
  currentSends: number;
  openRate: number;
  replyRate: number;
  spamRate: number;
  daysWarming: number;
  healthScore: number;
}

const mockWarmUpAccounts: WarmUpAccount[] = [
  {
    id: '1',
    email: 'john.smith@company.com',
    status: 'ready',
    dailyLimit: 50,
    currentSends: 45,
    openRate: 45.2,
    replyRate: 12.8,
    spamRate: 0.5,
    daysWarming: 14,
    healthScore: 92
  },
  {
    id: '2',
    email: 'jane.doe@company.com',
    status: 'warming',
    dailyLimit: 25,
    currentSends: 18,
    openRate: 38.7,
    replyRate: 8.3,
    spamRate: 1.2,
    daysWarming: 7,
    healthScore: 78
  },
  {
    id: '3',
    email: 'sales@company.com',
    status: 'issues',
    dailyLimit: 30,
    currentSends: 12,
    openRate: 25.1,
    replyRate: 4.2,
    spamRate: 8.3,
    daysWarming: 21,
    healthScore: 45
  }
];

export function WarmUpDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'warming': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'issues': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warming': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'paused': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      case 'issues': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalAccounts = mockWarmUpAccounts.length;
  const readyAccounts = mockWarmUpAccounts.filter(acc => acc.status === 'ready').length;
  const avgHealthScore = mockWarmUpAccounts.reduce((sum, acc) => sum + acc.healthScore, 0) / totalAccounts;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Warm-Up Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Monitor your email accounts' deliverability and warm-up progress
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Email accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready to Send</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyAccounts}</div>
            <p className="text-xs text-muted-foreground">Fully warmed up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgHealthScore)}%</div>
            <p className="text-xs text-muted-foreground">Deliverability health</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Sends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockWarmUpAccounts.reduce((sum, acc) => sum + acc.currentSends, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {mockWarmUpAccounts.reduce((sum, acc) => sum + acc.dailyLimit, 0)} limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Account Status</h3>
          <Button variant="outline" size="sm">
            Add Account
          </Button>
        </div>

        {mockWarmUpAccounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{account.email}</CardTitle>
                    <CardDescription>
                      Warming for {account.daysWarming} days
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(account.status)}
                  <Badge className={getStatusColor(account.status)} variant="secondary">
                    {account.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Health Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Health Score</span>
                    <span className="text-sm font-medium">{account.healthScore}%</span>
                  </div>
                  <Progress 
                    value={account.healthScore} 
                    className={`h-2 ${
                      account.healthScore >= 80 ? 'bg-green-100' :
                      account.healthScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}
                  />
                </div>

                {/* Daily Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Daily Usage</span>
                    <span className="text-sm font-medium">
                      {account.currentSends} / {account.dailyLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(account.currentSends / account.dailyLimit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {account.openRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {account.replyRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Reply Rate</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      account.spamRate > 2 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {account.spamRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Spam Rate</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {account.status === 'issues' && (
                    <Button variant="destructive" size="sm">
                      Fix Issues
                    </Button>
                  )}
                  {account.status === 'paused' && (
                    <Button size="sm">
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Notice */}
      <Card className="mt-6 border-dashed">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">Powered by Instantly API</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This warm-up system integrates with Instantly's infrastructure to maintain optimal deliverability.
            Real implementation would sync with your Instantly account for live data.
          </p>
          <Button variant="outline" size="sm">
            Configure Integration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}