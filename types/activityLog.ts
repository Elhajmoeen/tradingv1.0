export interface ActivityLog {
  id: string;
  entityType: 'client' | 'lead' | 'user' | 'transaction';
  entityId: string;
  action: ActivityAction;
  details: ActivityDetails;
  performedBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: string; // ISO date string
  metadata?: Record<string, any>;
}

export type ActivityAction = 
  | 'ASSIGNED'
  | 'DEPOSIT'
  | 'WITHDRAW' 
  | 'STATUS_CHANGE'
  | 'PROFILE_UPDATE'
  | 'DOCUMENT_UPLOAD'
  | 'COMMENT_ADDED'
  | 'EMAIL_SENT'
  | 'CALL_LOGGED'
  | 'MEETING_SCHEDULED'
  | 'KYC_UPDATE'
  | 'ACCOUNT_CREATED'
  | 'LEAD_CONVERTED'
  | 'RETENTION_ASSIGNED'
  | 'CONVERSATION_ASSIGNED'
  | 'PASSWORD_CHANGED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'DELETED';

export interface ActivityDetails {
  title: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  amount?: number;
  currency?: string;
  reason?: string;
  additionalData?: Record<string, any>;
}

export interface ActivityLogFilters {
  actions?: ActivityAction[];
  dateRange?: { from: string; to: string };
  performedBy?: string[];
  entityTypes?: string[];
  search?: string;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Activity icon mappings for timeline
export const ACTIVITY_ICONS: Record<ActivityAction, string> = {
  ASSIGNED: '👤',
  DEPOSIT: '💰',
  WITHDRAW: '💸',
  STATUS_CHANGE: '🔄',
  PROFILE_UPDATE: '✏️',
  DOCUMENT_UPLOAD: '📁',
  COMMENT_ADDED: '💬',
  EMAIL_SENT: '📧',
  CALL_LOGGED: '📞',
  MEETING_SCHEDULED: '📅',
  KYC_UPDATE: '🔐',
  ACCOUNT_CREATED: '🆕',
  LEAD_CONVERTED: '🎯',
  RETENTION_ASSIGNED: '🤝',
  CONVERSATION_ASSIGNED: '💭',
  PASSWORD_CHANGED: '🔑',
  LOGIN: '🔑',
  LOGOUT: '🚪',
  DELETED: '🗑️'
};

// Activity color mappings for timeline
export const ACTIVITY_COLORS: Record<ActivityAction, string> = {
  ASSIGNED: 'blue',
  DEPOSIT: 'green',
  WITHDRAW: 'red',
  STATUS_CHANGE: 'purple',
  PROFILE_UPDATE: 'orange',
  DOCUMENT_UPLOAD: 'indigo',
  COMMENT_ADDED: 'gray',
  EMAIL_SENT: 'blue',
  CALL_LOGGED: 'green',
  MEETING_SCHEDULED: 'purple',
  KYC_UPDATE: 'yellow',
  ACCOUNT_CREATED: 'emerald',
  LEAD_CONVERTED: 'teal',
  RETENTION_ASSIGNED: 'pink',
  CONVERSATION_ASSIGNED: 'cyan',
  PASSWORD_CHANGED: 'red',
  LOGIN: 'green',
  LOGOUT: 'gray',
  DELETED: 'red'
};