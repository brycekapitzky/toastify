import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  MousePointer,
  MessageSquare,
  Calendar,
  User,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { 
  getStageLabel, 
  getStatusColor,
  getEngagementGroupColor,
  getEngagementGroupLabel,
  formatCompanyInfo,
  formatLastContact,
  matchesSearchTerm,
  sortProspects,
  isDemoProspect
} from "../utils/prospectUtils";
import { LoadingEmptyState, EmptyState } from "./EmptyStates";
import type { EnhancedProspect } from "../types";

interface ProspectsTableProps {
  prospects: EnhancedProspect[];
  onSelectProspect: (prospect: EnhancedProspect) => void;
  currentView: string;
  onImportClick: () => void;
  onAddEngagement?: (prospectId: string, event: any) => void;
  isDemo?: boolean;
}

export function ProspectsTable({
  prospects,
  onSelectProspect,
  currentView,
  onImportClick,
  onAddEngagement,
  isDemo = false,
}: ProspectsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Get view title
  const getViewTitle = () => {
    const titles: Record<string, string> = {
      cold: "Cold Prospects",
      warming: "Warming Prospects",
      interested: "Interested Prospects", 
      "hot-lead": "Hot Leads",
      all: "All Prospects",
    };
    return titles[currentView] || "Prospects";
  };

  // Filter and sort prospects
  const filteredAndSortedProspects = useMemo(() => {
    let filtered = prospects.filter((prospect) => {
      // Search filter
      if (!matchesSearchTerm(prospect, searchTerm)) return false;
      
      // Status filter
      if (statusFilter !== "all" && prospect.status !== statusFilter) return false;
      
      return true;
    });

    // Sort prospects
    return sortProspects(filtered, sortBy, sortOrder);
  }, [prospects, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const handleQuickAction = async (prospect: EnhancedProspect, action: string) => {
    if (isDemo) {
      alert(`Demo mode: ${action} action would be performed on ${prospect.name}`);
      return;
    }

    if (!onAddEngagement) return;

    const eventMap: Record<string, any> = {
      "mark_contacted": {
        type: "email_sent",
        description: "Marked as contacted manually"
      },
      "schedule_followup": {
        type: "meeting_scheduled", 
        description: "Follow-up scheduled"
      },
      "mark_replied": {
        type: "email_replied",
        description: "Prospect replied"
      },
    };

    const event = eventMap[action];
    if (event) {
      await onAddEngagement(prospect.id, event);
    }
  };

  if (prospects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          title="No prospects yet"
          description="Get started by importing your prospect list or adding contacts manually."
          actionLabel="Import Prospects"
          onAction={onImportClick}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1>{getViewTitle()}</h1>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedProspects.length} of {prospects.length} prospects
              {isDemo && ` (${isDemoProspect({ id: 'demo-1' } as EnhancedProspect) ? 'Demo Data' : 'Live Data'})`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onImportClick}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="handoff">Hand-off</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-gray-100" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="engagement_group">Engagement</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                  <SelectItem value="last_contacted_at">Last Contact</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSortBy("updated_at");
                    setSortOrder("desc");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedProspects.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <EmptyState
              title="No prospects match your filters"
              description="Try adjusting your search or filter criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-medium"
                  >
                    Contact {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("company")}
                    className="h-auto p-0 font-medium"
                  >
                    Company {getSortIcon("company")}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Opens</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MousePointer className="h-3 w-3" />
                    <span>Clicks</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Replies</span>
                  </div>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("last_contacted_at")}
                    className="h-auto p-0 font-medium"
                  >
                    Last Contact {getSortIcon("last_contacted_at")}
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProspects.map((prospect) => (
                <TableRow
                  key={prospect.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectProspect(prospect)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {prospect.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {prospect.name || 'Unknown Contact'}
                        </div>
                        <div className="text-sm text-gray-600">{prospect.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {prospect.company || '—'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {prospect.title || '—'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(prospect.status)}>
                      {prospect.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEngagementGroupColor(prospect.engagement_group || 0)}>
                      {getEngagementGroupLabel(prospect.engagement_group || 0)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getStageLabel(prospect.current_stage || 0)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{prospect.opens || 0}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{prospect.clicks || 0}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{prospect.replies || 0}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatLastContact(prospect)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProspect(prospect);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction(prospect, "mark_contacted");
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Mark Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction(prospect, "schedule_followup");
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction(prospect, "mark_replied");
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Mark as Replied
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedProspects.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {filteredAndSortedProspects.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {filteredAndSortedProspects.reduce((sum, p) => sum + (p.opens || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Opens</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {filteredAndSortedProspects.reduce((sum, p) => sum + (p.clicks || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Clicks</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {filteredAndSortedProspects.reduce((sum, p) => sum + (p.replies || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Replies</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-amber-600">
                {(filteredAndSortedProspects.reduce((sum, p) => sum + (p.replies || 0), 0) / 
                  Math.max(filteredAndSortedProspects.length, 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Reply Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}