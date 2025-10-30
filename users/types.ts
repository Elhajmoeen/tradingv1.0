export type UserRole = "Admin" | "Agent" | "Manager" | "Viewer";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdOn: string;
  updatedOn?: string;
  createdBy: string;
}

export interface AgentDirectoryItem {
  id: string;
  displayName: string;
  email?: string;
  extension?: string;
}

export interface AgentScopeResponse {
  agentIds: string[];
}
// PATCH: end users types (team leader)

// Re-export existing types for compatibility
export type { CrmUser, UserPermission } from '@/state/usersSlice';