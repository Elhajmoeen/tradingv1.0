import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { 
  ActivityLog, 
  ActivityLogFilters, 
  ActivityLogResponse, 
  ActivityAction,
  ActivityDetails 
} from '@/types/activityLog';

interface ActivityLogState {
  logs: ActivityLog[];
  loading: boolean;
  error: string | null;
  filters: ActivityLogFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: ActivityLogState = {
  logs: [],
  loading: false,
  error: null,
  filters: {
    dateRange: undefined,
    actions: undefined,
    performedBy: undefined,
    entityTypes: undefined,
    search: undefined
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false
  }
};

// Async thunks for API calls
export const fetchActivityLogs = createAsyncThunk(
  'activityLogs/fetchLogs',
  async (params: { entityId: string; filters?: ActivityLogFilters; page?: number; pageSize?: number }, { getState }) => {
    const { entityId, filters = {}, page = 1, pageSize = 20 } = params;
    
    // Get current logs from state
    const state = getState() as any;
    const allLogs = state.activityLogs.logs as ActivityLog[];
    
    // Filter logs for this specific entity
    let entityLogs = allLogs.filter(log => log.entityId === entityId);
    
    // Apply filters if provided
    if (filters.actions && filters.actions.length > 0) {
      entityLogs = entityLogs.filter(log => filters.actions!.includes(log.action));
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      entityLogs = entityLogs.filter(log => 
        log.details.title.toLowerCase().includes(searchTerm) ||
        log.details.description?.toLowerCase().includes(searchTerm) ||
        log.performedBy.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by timestamp (newest first)
    entityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLogs = entityLogs.slice(startIndex, endIndex);
    
    // If no real logs exist yet, add some initial mock data on first load
    if (page === 1 && entityLogs.length === 0) {
      const mockLogs = generateMockLogs(entityId, 5); // Just a few initial mock logs
      return {
        logs: mockLogs,
        total: mockLogs.length,
        page,
        pageSize,
        hasMore: false
      };
    }
    
    return {
      logs: paginatedLogs,
      total: entityLogs.length,
      page,
      pageSize,
      hasMore: endIndex < entityLogs.length
    };
  }
);

export const recordActivity = createAsyncThunk(
  'activityLogs/recordActivity',
  async (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    // In a real app, this would post to API
    const newActivity: ActivityLog = {
      ...activity,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    return newActivity;
  }
);

const activityLogSlice = createSlice({
  name: 'activityLogs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ActivityLogFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearLogs: (state) => {
      state.logs = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        const { logs, page, total, hasMore } = action.payload;
        
        // For page 1, replace logs; for other pages, append
        if (page === 1) {
          // Keep existing logs in global state, just update display
          const existingGlobalLogs = state.logs;
          state.logs = [...existingGlobalLogs, ...logs.filter(log => !existingGlobalLogs.find(existing => existing.id === log.id))];
        }
        
        state.pagination = {
          page,
          pageSize: state.pagination.pageSize,
          total,
          hasMore
        };
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activity logs';
      })
      // Record new activity
      .addCase(recordActivity.fulfilled, (state, action) => {
        // Add to the beginning of the logs array
        state.logs.unshift(action.payload);
        state.pagination.total += 1;
        console.log('✅ New activity recorded:', action.payload);
      });
  },
});

// Helper function to generate mock logs
function generateMockLogs(entityId: string, count: number): ActivityLog[] {
  const actions: ActivityAction[] = ['DEPOSIT', 'WITHDRAW', 'STATUS_CHANGE', 'PROFILE_UPDATE', 'ASSIGNED', 'COMMENT_ADDED', 'EMAIL_SENT', 'CALL_LOGGED'];
  const users = [
    { id: 'user1', name: 'John Smith', role: 'Agent' },
    { id: 'user2', name: 'Emma Davis', role: 'Manager' },
    { id: 'user3', name: 'Mike Wilson', role: 'Admin' }
  ];

  return Array.from({ length: count }, (_, index) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const timestamp = new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString(); // 2 hours apart

    let details: ActivityDetails;

    switch (action) {
      case 'DEPOSIT':
        details = {
          title: 'Deposit Processed',
          description: 'Client made a deposit via credit card',
          amount: Math.floor(Math.random() * 5000) + 100,
          currency: 'USD',
          additionalData: { paymentMethod: 'Credit Card', gateway: 'Stripe' }
        };
        break;
      case 'WITHDRAW':
        details = {
          title: 'Withdrawal Requested',
          description: 'Client requested a withdrawal',
          amount: Math.floor(Math.random() * 2000) + 50,
          currency: 'USD',
          reason: 'Client request'
        };
        break;
      case 'STATUS_CHANGE':
        details = {
          title: 'Lead Status Updated',
          description: 'Lead status changed from Hot to Qualified',
          oldValue: 'Hot',
          newValue: 'Qualified'
        };
        break;
      case 'ASSIGNED':
        details = {
          title: 'Retention Owner Assigned',
          description: `Assigned to ${user.name}`,
          newValue: user.name
        };
        break;
      default:
        details = {
          title: `${action.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`,
          description: `Activity logged for ${action.toLowerCase().replace('_', ' ')}`
        };
    }

    return {
      id: `log_${entityId}_${index}`,
      entityType: 'client' as const,
      entityId,
      action,
      details,
      performedBy: user,
      timestamp,
      metadata: { source: 'web', ip: '192.168.1.100' }
    };
  });
}

export const { setFilters, clearFilters, setPage, clearLogs } = activityLogSlice.actions;

// Selectors
export const selectActivityLogs = (state: RootState) => state.activityLogs.logs;
export const selectActivityLogsLoading = (state: RootState) => state.activityLogs.loading;
export const selectActivityLogsError = (state: RootState) => state.activityLogs.error;
export const selectActivityLogsFilters = (state: RootState) => state.activityLogs.filters;
export const selectActivityLogsPagination = (state: RootState) => state.activityLogs.pagination;

// Selector for logs of a specific entity
export const selectActivityLogsForEntity = (state: RootState, entityId: string) => 
  state.activityLogs.logs
    .filter(log => log.entityId === entityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export default activityLogSlice.reducer;