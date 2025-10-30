import { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { recordActivity } from '@/state/activityLogSlice';
import type { RootState, AppDispatch } from '@/state/store';
import type { ActivityAction, ActivityDetails } from '@/types/activityLog';
import { selectCurrentUser } from '@/state/authSlice';

// Activity recording middleware that automatically logs actions
export const activityRecorderMiddleware: Middleware<{}, RootState, AppDispatch> = 
  (store) => (next) => (action: PayloadAction<any>) => {
    const result = next(action);
    
    // Get current user for logging
    const state = store.getState();
    const currentUser = selectCurrentUser(state);
    
    if (!currentUser) return result;

    // Define which actions should be logged and how
    const actionLoggers: Record<string, (action: PayloadAction<any>, state: RootState) => void> = {
      // Entity field updates (async thunk fulfilled)
      'entities/updateEntityField/fulfilled': (action, state) => {
        const { id, key, value, oldValue } = action.payload;
        
        console.log('🔄 Activity Recorder: Field update detected', { entityId: id, field: key, value, oldValue });
        
        let activityAction: ActivityAction = 'PROFILE_UPDATE';
        let title = 'Profile Updated';
        let description = `Updated ${key}`;

        // Map specific fields to more meaningful activity types
        switch (key) {
          case 'leadStatus':
            activityAction = 'STATUS_CHANGE';
            title = 'Lead Status Changed';
            description = `Lead status changed from ${oldValue} to ${value}`;
            break;
          case 'retentionOwner':
            activityAction = 'RETENTION_ASSIGNED';
            title = 'Retention Owner Assigned';
            description = `Retention owner assigned to ${value}`;
            break;
          case 'conversationOwner':
            activityAction = 'CONVERSATION_ASSIGNED';
            title = 'Conversation Owner Assigned';
            description = `Conversation owner assigned to ${value}`;
            break;
          case 'kycStatus':
            activityAction = 'KYC_UPDATE';
            title = 'KYC Status Updated';
            description = `KYC status changed to ${value}`;
            break;
        }

        const details: ActivityDetails = {
          title,
          description,
          oldValue,
          newValue: value,
          additionalData: { field: key }
        };

        store.dispatch(recordActivity({
          entityType: 'client',
          entityId: id,
          action: activityAction,
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      },

      // Transactions
      'transactions/addTransaction': (action, state) => {
        const transaction = action.payload;
        const isDeposit = transaction.type === 'deposit';
        
        const details: ActivityDetails = {
          title: isDeposit ? 'Deposit Processed' : 'Withdrawal Processed',
          description: `${isDeposit ? 'Deposit' : 'Withdrawal'} of ${transaction.currency} ${transaction.amount}`,
          amount: Math.abs(transaction.amount),
          currency: transaction.currency,
          additionalData: {
            transactionId: transaction.id,
            paymentMethod: transaction.paymentMethod,
            status: transaction.status
          }
        };

        store.dispatch(recordActivity({
          entityType: 'transaction',
          entityId: transaction.clientId,
          action: isDeposit ? 'DEPOSIT' : 'WITHDRAW',
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      },

      // Comments
      'comments/addComment': (action, state) => {
        const { entityId, comment } = action.payload;
        
        const details: ActivityDetails = {
          title: 'Comment Added',
          description: comment.length > 100 ? `${comment.substring(0, 100)}...` : comment,
          additionalData: { commentLength: comment.length }
        };

        store.dispatch(recordActivity({
          entityType: 'client',
          entityId,
          action: 'COMMENT_ADDED',
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      },

      // Email sent
      'email/sendEmail': (action, state) => {
        const { to, subject, entityId } = action.payload;
        
        const details: ActivityDetails = {
          title: 'Email Sent',
          description: `Email sent with subject: ${subject}`,
          additionalData: { 
            to,
            subject,
            timestamp: new Date().toISOString()
          }
        };

        store.dispatch(recordActivity({
          entityType: 'client',
          entityId,
          action: 'EMAIL_SENT',
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      },

      // Entity creation
      'entities/addEntity': (action, state) => {
        const entity = action.payload;
        
        const details: ActivityDetails = {
          title: entity.type === 'lead' ? 'Lead Created' : 'Client Created',
          description: `New ${entity.type} account created for ${entity.firstName} ${entity.lastName}`,
          additionalData: {
            entityType: entity.type,
            email: entity.email,
            phone: entity.phoneNumber
          }
        };

        store.dispatch(recordActivity({
          entityType: entity.type,
          entityId: entity.id,
          action: 'ACCOUNT_CREATED',
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      },

      // Lead conversion
      'entities/convertLead': (action, state) => {
        const { entityId } = action.payload;
        
        const details: ActivityDetails = {
          title: 'Lead Converted',
          description: 'Lead successfully converted to client',
          oldValue: 'lead',
          newValue: 'client'
        };

        store.dispatch(recordActivity({
          entityType: 'client',
          entityId,
          action: 'LEAD_CONVERTED',
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      },

      // Authentication activities
      'auth/login': (action, state) => {
        if (action.payload?.user) {
          const user = action.payload.user;
          
          const details: ActivityDetails = {
            title: 'User Login',
            description: 'User logged into the system',
            additionalData: {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              ip: 'Unknown' // Would be provided by backend in real app
            }
          };

          store.dispatch(recordActivity({
            entityType: 'user',
            entityId: user.id,
            action: 'LOGIN',
            details,
            performedBy: {
              id: user.id,
              name: user.fullName || user.email,
              role: user.permission || 'User'
            }
          }));
        }
      },

      'auth/logout': (action, state) => {
        const details: ActivityDetails = {
          title: 'User Logout',
          description: 'User logged out of the system',
          additionalData: {
            timestamp: new Date().toISOString()
          }
        };

        store.dispatch(recordActivity({
          entityType: 'user',
          entityId: currentUser.id,
          action: 'LOGOUT',
          details,
          performedBy: {
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email,
            role: currentUser.permission || 'User'
          }
        }));
      }
    };

    // Check if this action should be logged
    console.log('🎯 Activity Recorder: Action dispatched:', action.type);
    
    const logger = actionLoggers[action.type];
    if (logger) {
      console.log('✅ Activity Recorder: Logging activity for action:', action.type);
      try {
        logger(action, store.getState());
      } catch (error) {
        console.warn('❌ Failed to log activity for action:', action.type, error);
      }
    } else {
      console.log('⚠️ Activity Recorder: No logger found for action:', action.type);
    }

    return result;
  };

// Helper function to manually record custom activities
export const logCustomActivity = (dispatch: AppDispatch, activity: {
  entityId: string;
  entityType: 'client' | 'lead' | 'user' | 'transaction';
  action: ActivityAction;
  title: string;
  description?: string;
  additionalData?: Record<string, any>;
}) => {
  // This would typically get current user from context/state
  // For now using a placeholder
  const details: ActivityDetails = {
    title: activity.title,
    description: activity.description,
    additionalData: activity.additionalData
  };

  dispatch(recordActivity({
    entityType: activity.entityType,
    entityId: activity.entityId,
    action: activity.action,
    details,
    performedBy: {
      id: 'system',
      name: 'System',
      role: 'System'
    }
  }));
};

// Predefined activity creators for common scenarios
export const createDepositActivity = (dispatch: AppDispatch, {
  entityId,
  amount,
  currency,
  paymentMethod,
  transactionId,
  performedBy
}: {
  entityId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  performedBy: { id: string; name: string; role: string };
}) => {
  const details: ActivityDetails = {
    title: 'Deposit Processed',
    description: `Deposit of ${currency} ${amount.toLocaleString()} processed via ${paymentMethod}`,
    amount,
    currency,
    additionalData: {
      transactionId,
      paymentMethod,
      status: 'completed'
    }
  };

  dispatch(recordActivity({
    entityType: 'client',
    entityId,
    action: 'DEPOSIT',
    details,
    performedBy
  }));
};

export const createStatusChangeActivity = (dispatch: AppDispatch, {
  entityId,
  field,
  oldValue,
  newValue,
  performedBy
}: {
  entityId: string;
  field: string;
  oldValue: any;
  newValue: any;
  performedBy: { id: string; name: string; role: string };
}) => {
  const details: ActivityDetails = {
    title: 'Status Changed',
    description: `${field} changed from ${oldValue} to ${newValue}`,
    oldValue,
    newValue,
    additionalData: { field }
  };

  dispatch(recordActivity({
    entityType: 'client',
    entityId,
    action: 'STATUS_CHANGE',
    details,
    performedBy
  }));
};