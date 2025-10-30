export interface AccountTypeDTO {
  id: string;
  name: string;
  status?: 'ACTIVE'|'DISABLED'|string;
  createdAt?: string;
  createdByName?: string;
  // optional usage counts from API
  clientsCount?: number;
  leadsCount?: number;
}

export interface AccountTypeUsageDTO { 
  accountTypeId: string; 
  clients: number; 
  leads?: number; 
}