import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Building, MapPin, Briefcase, TrendingUp, Save, Bookmark, X, Check, Target, Zap, Loader2, Sparkles, Play, Mail, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface ProspectSearchDashboardProps {
  onSaveSearch?: (filters: any) => void;
}

export function ProspectSearchDashboard({ onSaveSearch }: ProspectSearchDashboardProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [filters, setFilters] = useState({
    companySize: 'all',
    revenue: 'all',
    location: '',
    industry: '',
    jobTitle: ''
  });

  const [prospectCount, setProspectCount] = useState(0);
  const [estimatedEmails, setEstimatedEmails] = useState(0);
  const [expectedReplies, setExpectedReplies] = useState(0);

  const [savedSearches, setSavedSearches] = useState([
    {
      id: '1',
      name: 'Tech Startups',
      filters: { companySize: '50-500', industry: 'Technology', location: 'United States' },
      count: 15420,
      isConnected: true,
      isActivated: true,
      lastUsed: '2024-01-15'
    },
    {
      id: '2',
      name: 'Healthcare SMBs',
      filters: { companySize: '10-100', industry: 'Healthcare', location: 'North America' },
      count: 8950,
      isConnected: false,
      isActivated: false,
      lastUsed: '2024-01-10'
    },
    {
      id: '3',
      name: 'E-commerce Leaders',
      filters: { companySize: '100+', industry: 'E-commerce', jobTitle: 'CEO, CTO' },
      count: 23100,
      isConnected: true,
      isActivated: false,
      lastUsed: '2024-01-08'
    }
  ]);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Calculate results based on filters
  const calculateResults = () => {
    let baseCount = 2500000;
    
    // Apply multipliers based on filters
    if (filters.companySize !== 'all') baseCount *= 0.4;
    if (filters.revenue !== 'all') baseCount *= 0.3;
    if (filters.location.trim()) baseCount *= 0.5;
    if (filters.industry.trim()) baseCount *= 0.3;
    if (filters.jobTitle.trim()) baseCount *= 0.2;
    
    const count = Math.floor(Math.max(1000, baseCount));
    const emails = Math.floor(count * 0.23);
    const replies = Math.floor(count * 0.05);
    
    return { count, emails, replies };
  };

  // Update results when filters change
  useEffect(() => {
    const results = calculateResults();
    setProspectCount(results.count);
    setEstimatedEmails(results.emails);
    setExpectedReplies(results.replies);
  }, [filters]);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchComplete(false);
    
    // Simulate search process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSearching(false);
    setSearchComplete(true);
    
    // Reset search complete status after 3 seconds
    setTimeout(() => setSearchComplete(false), 3000);
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) return;
    
    setIsSaving(true);
    
    // Simulate save process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      filters: { ...filters },
      count: prospectCount,
      isConnected: true,
      isActivated: false,
      lastUsed: new Date().toISOString().split('T')[0]
    };
    
    setSavedSearches(prev => [...prev, newSearch]);
    setSaveSearchName('');
    setShowSaveDialog(false);
    setIsSaving(false);
    setSaveSuccess(true);
    
    if (onSaveSearch) {
      onSaveSearch(filters);
    }
    
    // Reset success status
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsExporting(false);
    setExportSuccess(true);
    
    // Reset success status
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const loadSavedSearch = (search: any) => {
    setFilters(search.filters);
    // Update last used
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === search.id 
          ? { ...s, lastUsed: new Date().toISOString().split('T')[0] }
          : s
      )
    );
  };

  const toggleConnection = async (searchId: string) => {
    // Simulate connection toggle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === searchId 
          ? { ...s, isConnected: !s.isConnected, isActivated: !s.isConnected ? false : s.isActivated }
          : s
      )
    );
  };

  const toggleActivation = async (searchId: string) => {
    // Simulate activation toggle
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === searchId 
          ? { ...s, isActivated: !s.isActivated }
          : s
      )
    );
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const clearAllFilters = () => {
    setFilters({
      companySize: 'all',
      revenue: 'all',
      location: '',
      industry: '',
      jobTitle: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== ''
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-100 border-b border-border/50 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm">
                <Search className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Prospect Search</h1>
                <p className="text-sm text-gray-600">
                  Find your ideal B2B prospects and connect them to your Main Sequence
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Check className="h-3 w-3 mr-1" />
                  Search Saved!
                </Badge>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                disabled={!hasActiveFilters || isSaving}
                className="bg-white/70 backdrop-blur-sm border-white/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search Results Summary */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {prospectCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Prospects Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {estimatedEmails.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Valid Emails</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {expectedReplies.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Expected Replies</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !hasActiveFilters}
                    className={`transition-all duration-200 ${
                      searchComplete 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                    } text-white`}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : searchComplete ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Search Complete!
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Run Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Search Filters - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Filters Bar */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Quick Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Company Size */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-500" />
                      Company Size
                    </Label>
                    <Select value={filters.companySize} onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Size</SelectItem>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Revenue */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Annual Revenue
                    </Label>
                    <Select value={filters.revenue} onValueChange={(value) => setFilters(prev => ({ ...prev, revenue: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any revenue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Revenue</SelectItem>
                        <SelectItem value="0-1M">$0-1M</SelectItem>
                        <SelectItem value="1-10M">$1-10M</SelectItem>
                        <SelectItem value="10-50M">$10-50M</SelectItem>
                        <SelectItem value="50-100M">$50-100M</SelectItem>
                        <SelectItem value="100M+">$100M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Location
                    </Label>
                    <Select value={filters.location || "any"} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value === "any" ? "" : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Location</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Netherlands">Netherlands</SelectItem>
                        <SelectItem value="Sweden">Sweden</SelectItem>
                        <SelectItem value="Denmark">Denmark</SelectItem>
                        <SelectItem value="Singapore">Singapore</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="Florida">Florida</SelectItem>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="Toronto">Toronto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Industry */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-orange-500" />
                      Industry
                    </Label>
                    <Select value={filters.industry || "any"} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value === "any" ? "" : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Industry</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
                        <SelectItem value="Non-profit">Non-profit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Job Title
                    </Label>
                    <Select value={filters.jobTitle || "any"} onValueChange={(value) => setFilters(prev => ({ ...prev, jobTitle: value === "any" ? "" : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Job Title</SelectItem>
                        <SelectItem value="CEO">CEO</SelectItem>
                        <SelectItem value="CTO">CTO</SelectItem>
                        <SelectItem value="CMO">CMO</SelectItem>
                        <SelectItem value="CFO">CFO</SelectItem>
                        <SelectItem value="VP Sales">VP Sales</SelectItem>
                        <SelectItem value="VP Marketing">VP Marketing</SelectItem>
                        <SelectItem value="Director of Sales">Director of Sales</SelectItem>
                        <SelectItem value="Director of Marketing">Director of Marketing</SelectItem>
                        <SelectItem value="Head of Growth">Head of Growth</SelectItem>
                        <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                        <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                        <SelectItem value="Business Development">Business Development</SelectItem>
                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                        <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                        <SelectItem value="IT Director">IT Director</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Filter className="h-4 w-4 text-blue-500" />
                    Active Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (value === 'all' || value === '') return null;
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200"
                        >
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                          <button
                            onClick={() => setFilters(prev => ({ 
                              ...prev, 
                              [key]: key === 'companySize' || key === 'revenue' ? 'all' : '' 
                            }))}
                            className="ml-2 hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Tips */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Start with broad filters like company size and location, then narrow down with specific industries and job titles for better results.
              </AlertDescription>
            </Alert>
          </div>

          {/* Saved Searches - Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Main Sequence Sources
                </CardTitle>
                <CardDescription>Saved searches feeding your main email sequence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="p-3 rounded-lg border hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <button
                          onClick={() => loadSavedSearch(search)}
                          className="flex-1 text-left hover:text-blue-600 transition-colors"
                        >
                          <div className="font-medium text-sm">{search.name}</div>
                          <div className="text-xs text-gray-500">
                            {search.count.toLocaleString()} prospects • {search.lastUsed}
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSavedSearch(search.id)}
                          className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Connection Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                            <Badge 
                              variant={search.isConnected ? "default" : "secondary"}
                              className={`text-xs ${
                                search.isConnected 
                                  ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                  : 'bg-gray-100 text-gray-600 border-gray-300'
                              }`}
                            >
                              {search.isConnected ? 'Connected' : 'Disconnected'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleConnection(search.id)}
                            className={`h-6 px-2 text-xs ${
                              search.isConnected 
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            {search.isConnected ? 'Disconnect' : 'Connect to Main Sequence'}
                          </Button>
                        </div>
                        
                        {/* Activation Status - Only show if connected */}
                        {search.isConnected && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Play className="h-3 w-3 text-green-500" />
                              <span className={`text-xs font-medium ${
                                search.isActivated ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {search.isActivated ? 'Activated' : 'Not Activated'}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleActivation(search.id)}
                              className={`h-6 px-2 text-xs ${
                                search.isActivated 
                                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                            >
                              {search.isActivated ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Search Dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Search to Main Sequence</DialogTitle>
                  <DialogDescription>
                    Give your search a memorable name. It will be automatically connected to your main sequence to start feeding prospects.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-name">Search Name</Label>
                    <Input
                      id="search-name"
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                      placeholder="e.g., Tech Startups in California"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSearch}
                      disabled={!saveSearchName.trim() || isSaving}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save & Connect to Sequence
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}