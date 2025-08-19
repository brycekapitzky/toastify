import React, { useState } from 'react';
import { Users, Filter, Download, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProspectsTable } from './ProspectsTable';
import { type Prospect } from './mockData';

interface ProspectsManagementProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onImportClick: () => void;
  onAddEngagement: (prospectId: string, type: string, description: string) => void;
  isDemo: boolean;
}

export function ProspectsManagement({ 
  prospects, 
  onSelectProspect, 
  onImportClick, 
  onAddEngagement, 
  isDemo 
}: ProspectsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;
    
    const matchesStage = stageFilter === 'all' || prospect.group.toString() === stageFilter;

    return matchesSearch && matchesStatus && matchesStage;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-100 border-b border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Prospects Management</h1>
                <p className="text-sm text-gray-600">
                  {filteredProspects.length} of {prospects.length} prospects
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onImportClick} className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/70 backdrop-blur-sm border-white/30"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-white/70 backdrop-blur-sm border-white/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="handoff">Hand-off</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px] bg-white/70 backdrop-blur-sm border-white/30">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="0">Cold</SelectItem>
                <SelectItem value="1">Warming</SelectItem>
                <SelectItem value="2">Warming</SelectItem>
                <SelectItem value="3">Interested</SelectItem>
                <SelectItem value="4">Hot Lead</SelectItem>
                <SelectItem value="5">Very Hot</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-white/70 backdrop-blur-sm border-white/30">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <ProspectsTable
          prospects={filteredProspects}
          onSelectProspect={onSelectProspect}
          currentView="prospects"
          onImportClick={onImportClick}
          onAddEngagement={onAddEngagement}
          isDemo={isDemo}
        />
      </div>
    </div>
  );
}