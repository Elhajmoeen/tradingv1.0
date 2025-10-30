export interface Draft {
  id: string;
  entityId: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  attachments: Attachment[];
  settings: EmailSettings;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string;
  sentAt?: string;
  threadId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
}

export interface EmailSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  signatureId?: string;
  templateId?: string;
  fromEmail?: string;
  accountId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject?: string;
  bodyHtml?: string;
}

export interface EmailAccount {
  id: string;
  label: string;
  fromEmail: string;
  signature?: string;
}

export interface EntityContext {
  entityType: 'client' | 'lead';
  entityName: string;
  accountId?: string;
}

export interface EmailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  defaultRecipients?: string[];
  context?: EntityContext;
}