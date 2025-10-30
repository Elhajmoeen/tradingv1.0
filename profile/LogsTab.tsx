import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { 
  Clock, 
  Filter, 
  Search, 
  ChevronDown, 
  RefreshCw,
  Calendar,
  User,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  fetchActivityLogs,
  selectActivityLogsForEntity,
  selectActivityLogsLoading,
  selectActivityLogsError,
  selectActivityLogsPagination,
  selectActivityLogsFilters,
  setFilters,
  setPage
} from '@/state/activityLogSlice';
import type { RootState, AppDispatch } from '@/state/store';
import type { ActivityAction, ActivityLog } from '@/types/activityLog';

interface LogsTabProps {
  entityId: string;
  entityType: 'client' | 'lead';
}

// Icon mapping for different activity types
const getActivityIcon = (action: ActivityAction) => {
  const iconMap: Record<ActivityAction, React.ReactNode> = {
    ASSIGNED: <UserPlus className="w-4 h-4" />,
    DEPOSIT: <ArrowDownCircle className="w-4 h-4 text-green-600" />,
    WITHDRAW: <ArrowUpCircle className="w-4 h-4 text-red-600" />,
    STATUS_CHANGE: <Settings className="w-4 h-4 text-purple-600" />,
    PROFILE_UPDATE: <User className="w-4 h-4 text-blue-600" />,
    DOCUMENT_UPLOAD: <FileText className="w-4 h-4 text-indigo-600" />,
    COMMENT_ADDED: <MessageCircle className="w-4 h-4 text-gray-600" />,
    EMAIL_SENT: <Mail className="w-4 h-4 text-blue-600" />,
    CALL_LOGGED: <Phone className="w-4 h-4 text-green-600" />,
    MEETING_SCHEDULED: <Calendar className="w-4 h-4 text-purple-600" />,
    KYC_UPDATE: <Settings className="w-4 h-4 text-yellow-600" />,
    ACCOUNT_CREATED: <User className="w-4 h-4 text-emerald-600" />,
    LEAD_CONVERTED: <ArrowUpCircle className="w-4 h-4 text-teal-600" />,
    RETENTION_ASSIGNED: <UserPlus className="w-4 h-4 text-pink-600" />,
    CONVERSATION_ASSIGNED: <MessageCircle className="w-4 h-4 text-cyan-600" />,
    PASSWORD_CHANGED: <Settings className="w-4 h-4 text-red-600" />,
    LOGIN: <ArrowDownCircle className="w-4 h-4 text-green-600" />,
    LOGOUT: <ArrowUpCircle className="w-4 h-4 text-gray-600" />,
    DELETED: <Settings className="w-4 h-4 text-red-600" />
  };
  return iconMap[action] || <Settings className="w-4 h-4" />;
};

// Get color for activity type
const getActivityColor = (action: ActivityAction): string => {
  const colorMap: Record<ActivityAction, string> = {
    ASSIGNED: 'bg-blue-100 border-blue-200',
    DEPOSIT: 'bg-green-100 border-green-200',
    WITHDRAW: 'bg-red-100 border-red-200',
    STATUS_CHANGE: 'bg-purple-100 border-purple-200',
    PROFILE_UPDATE: 'bg-orange-100 border-orange-200',
    DOCUMENT_UPLOAD: 'bg-indigo-100 border-indigo-200',
    COMMENT_ADDED: 'bg-gray-100 border-gray-200',
    EMAIL_SENT: 'bg-blue-100 border-blue-200',
    CALL_LOGGED: 'bg-green-100 border-green-200',
    MEETING_SCHEDULED: 'bg-purple-100 border-purple-200',
    KYC_UPDATE: 'bg-yellow-100 border-yellow-200',
    ACCOUNT_CREATED: 'bg-emerald-100 border-emerald-200',
    LEAD_CONVERTED: 'bg-teal-100 border-teal-200',
    RETENTION_ASSIGNED: 'bg-pink-100 border-pink-200',
    CONVERSATION_ASSIGNED: 'bg-cyan-100 border-cyan-200',
    PASSWORD_CHANGED: 'bg-red-100 border-red-200',
    LOGIN: 'bg-green-100 border-green-200',
    LOGOUT: 'bg-gray-100 border-gray-200',
    DELETED: 'bg-red-100 border-red-200'
  };
  return colorMap[action] || 'bg-gray-100 border-gray-200';
};

// Format timestamp for display
const formatTimestamp = (timestamp: string) => {
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }
  return format(date, 'MMM dd, yyyy \'at\' HH:mm');
};

// Group logs by date
const groupLogsByDate = (logs: ActivityLog[]) => {
  const groups: Record<string, ActivityLog[]> = {};
  
  logs.forEach(log => {
    const date = parseISO(log.timestamp);
    let groupKey: string;
    
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else {
      groupKey = format(date, 'EEEE, MMMM dd, yyyy');
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(log);
  });
  
  return groups;
};

export default function LogsTab({ entityId, entityType }: LogsTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  const logs = useSelector((state: RootState) => selectActivityLogsForEntity(state, entityId));
  const loading = useSelector(selectActivityLogsLoading);
  const error = useSelector(selectActivityLogsError);
  const pagination = useSelector(selectActivityLogsPagination);
  const filters = useSelector(selectActivityLogsFilters);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActions, setSelectedActions] = useState<ActivityAction[]>([]);

  // Load initial logs
  useEffect(() => {
    dispatch(fetchActivityLogs({ 
      entityId, 
      filters: { ...filters, search: searchTerm } 
    }));
  }, [dispatch, entityId, searchTerm]);

  // Test: Add a manual activity when component mounts (for testing)
  useEffect(() => {
    console.log('🔧 LogsTab mounted for entity:', entityId);
  }, [entityId]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      dispatch(setPage(pagination.page + 1));
      dispatch(fetchActivityLogs({ 
        entityId, 
        filters,
        page: pagination.page + 1 
      }));
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchActivityLogs({ 
      entityId, 
      filters,
      page: 1 
    }));
  };

  // Filter actions
  const availableActions: ActivityAction[] = [
    'DEPOSIT', 'WITHDRAW', 'STATUS_CHANGE', 'ASSIGNED', 'PROFILE_UPDATE',
    'COMMENT_ADDED', 'EMAIL_SENT', 'CALL_LOGGED', 'DOCUMENT_UPLOAD'
  ];

  const filteredLogs = logs.filter(log => {
    if (selectedActions.length > 0 && !selectedActions.includes(log.action)) {
      return false;
    }
    return true;
  });

  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Activity Types
            </label>
            <div className="flex flex-wrap gap-2">
              {availableActions.map(action => (
                <button
                  key={action}
                  onClick={() => {
                    if (selectedActions.includes(action)) {
                      setSelectedActions(selectedActions.filter(a => a !== action));
                    } else {
                      setSelectedActions([...selectedActions, action]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedActions.includes(action)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {action.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-8">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {Object.entries(groupedLogs).map(([dateGroup, dayLogs]) => (
          <div key={dateGroup}>
            {/* Date header */}
            <div className="flex items-center mb-4">
              <h4 className="text-sm font-semibold text-gray-900 bg-white px-3 py-1 rounded-full border">
                {dateGroup}
              </h4>
              <div className="flex-1 h-px bg-gray-200 ml-4" />
            </div>

            {/* Timeline items */}
            <div className="space-y-4 pl-4">
              {dayLogs.map((log, index) => (
                <div key={log.id} className="flex items-start gap-4 relative">
                  {/* Timeline line */}
                  {index < dayLogs.length - 1 && (
                    <div className="absolute left-6 top-10 w-px h-12 bg-gray-200" />
                  )}
                  
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getActivityColor(log.action)}`}>
                    {getActivityIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-semibold text-gray-900">
                          {log.details.title}
                        </h5>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.details.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {log.details.description}
                        </p>
                      )}

                      {/* Amount display for financial activities */}
                      {log.details.amount && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className={`font-semibold ${
                            log.action === 'DEPOSIT' ? 'text-green-600' : 
                            log.action === 'WITHDRAW' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {log.details.currency || 'USD'} {log.details.amount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Value changes */}
                      {(log.details.oldValue || log.details.newValue) && (
                        <div className="text-xs text-gray-500 mb-2">
                          {log.details.oldValue && (
                            <span>From: <span className="font-medium">{log.details.oldValue}</span></span>
                          )}
                          {log.details.oldValue && log.details.newValue && <span> → </span>}
                          {log.details.newValue && (
                            <span>To: <span className="font-medium">{log.details.newValue}</span></span>
                          )}
                        </div>
                      )}

                      {/* Performed by */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>
                            {log.performedBy.name} ({log.performedBy.role})
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {log.action.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Load more button */}
        {pagination.hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Load More Activities
                </>
              )}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && logs.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
            <p className="text-gray-600">
              Activities will appear here when actions are performed on this {entityType}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}