import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import type { TransactionRecord } from '../types/finance'
import type { RootState } from './store'

interface TransactionsState {
  byClientId: Record<string, TransactionRecord[]>
}

const initialState: TransactionsState = {
  byClientId: {}
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<TransactionRecord>) => {
      const t = action.payload
      if (!state.byClientId[t.clientId]) state.byClientId[t.clientId] = []
      state.byClientId[t.clientId].unshift(t) // newest first
    },
    clearAllTransactions: (state) => {
      console.log('🧹 Clearing all transaction data...')
      state.byClientId = {}
    }
  }
})

// Helper selector to calculate finance aggregates for a client up to a specific transaction time
const selectFinanceAggregatesForClient = createSelector(
  [
    (state: RootState, clientId: string) => state.transactions.byClientId[clientId] || [],
    (state: RootState, clientId: string, upToDate?: string) => upToDate,
  ],
  (transactions, upToDate) => {
    const upToTimestamp = upToDate ? new Date(upToDate).getTime() : Date.now()
    
    // Filter transactions up to the specified date
    const relevantTransactions = transactions.filter(tx => 
      new Date(tx.createdAtISO).getTime() <= upToTimestamp
    )
    
    const deposits = relevantTransactions.filter(tx => tx.kind === 'Deposit')
    const withdrawals = relevantTransactions.filter(tx => tx.kind === 'Withdraw') 
    const credits = relevantTransactions.filter(tx => tx.kind === 'Credit')
    const creditOuts = relevantTransactions.filter(tx => tx.kind === 'Credit Out')
    
    // FTD metrics
    const ftdTransaction = deposits.find(tx => tx.ftd === true)
    const totalFtd = ftdTransaction ? ftdTransaction.amount : 0
    const ftdDate = ftdTransaction ? ftdTransaction.createdAtISO : null
    const ftd = ftdTransaction ? ftdTransaction.amount : null
    const ftdSelf = ftdTransaction ? ftdTransaction.createdBy === 'Client' : false
    
    // FTW metrics  
    const ftwTransaction = withdrawals.find(tx => tx.ftw === true)
    const ftwDate = ftwTransaction ? ftwTransaction.createdAtISO : null
    const ftwSelf = ftwTransaction ? ftwTransaction.createdBy === 'Client' : false
    
    // Deposit aggregates
    const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0)
    const netDeposits = totalDeposits - withdrawals.reduce((sum, tx) => sum + tx.amount, 0)
    const firstDepositDate = deposits.length > 0 ? deposits[deposits.length - 1].createdAtISO : null
    const lastDepositDate = deposits.length > 0 ? deposits[0].createdAtISO : null
    
    // Withdrawal aggregates
    const totalWithdrawals = withdrawals.reduce((sum, tx) => sum + tx.amount, 0)
    const netWithdrawals = totalWithdrawals
    const firstWithdrawalDate = withdrawals.length > 0 ? withdrawals[withdrawals.length - 1].createdAtISO : null
    const lastWithdrawalDate = withdrawals.length > 0 ? withdrawals[0].createdAtISO : null
    
    // Credit aggregates
    const totalCredits = credits.reduce((sum, tx) => sum + tx.amount, 0)
    const creditsOut = creditOuts.reduce((sum, tx) => sum + tx.amount, 0)
    const netCredits = totalCredits - creditsOut
    
    // Chargeback aggregates (assuming chargebacks are Credit Out transactions or marked separately)
    const totalChargebacks = creditOuts.reduce((sum, tx) => sum + tx.amount, 0)
    
    return {
      // FTD metrics
      totalFtd,
      ftdDate,
      ftd,
      ftdSelf,
      
      // FTW metrics
      ftwDate,
      ftwSelf,
      
      // Deposit metrics
      totalDeposits,
      netDeposits,
      firstDepositDate,
      lastDepositDate,
      
      // Withdrawal metrics
      totalWithdrawals,
      netWithdrawals,
      firstWithdrawalDate,
      lastWithdrawalDate,
      
      // Credit metrics
      totalCredits,
      netCredits,
      creditsOut,
      totalChargebacks,
    }
  }
)

// Main selector for transaction entity rows with comprehensive data
export const selectTransactionEntityRows = createSelector(
  [
    (state: RootState) => state.transactions.byClientId,
    (state: RootState) => state.entities.entities,
  ],
  (byClientId, entities) => {
    const allRows: any[] = []
    
    // Process all clients and their transactions
    Object.entries(byClientId ?? {}).forEach(([clientId, txList]) => {
      const profile = entities.find(e => e.id === clientId || e.accountId === clientId)
      if (!profile) return
      
      (txList ?? []).forEach(tx => {
        // Calculate finance aggregates up to this transaction's timestamp
        // This gives us the financial state at the time of this transaction
        
        const row = {
          // EntityTable required fields
          id: `${profile.id}-${tx.id}`,
          type: 'transaction' as const,

          // ——— Profile / CRM Context ———
          accountId: profile.accountId ?? null,
          profileCreatedAt: profile.createdAt ?? null,
          status: profile.status ?? 'offline', // Online/offline status
          desk: profile.desk ?? null,
          salesManager: profile.salesManager ?? null,
          conversationOwner: profile.conversationOwner ?? null,
          retentionOwner: profile.retentionOwner ?? null,
          retentionManager: profile.retentionManager ?? profile.retentionOwner ?? null,
          accountType: profile.accountType ?? null,
          regulation: profile.regulation ?? null,
          firstName: profile.firstName ?? null,
          lastName: profile.lastName ?? null,
          email: profile.email ?? null,
          phoneNumber: profile.phoneNumber ?? null,
          lastContactAt: profile.lastContactAt ?? null,
          lastCommentAt: profile.lastCommentAt ?? null,
          firstLoginAt: profile.firstLoginAt ?? null,
          lastLoginAt: profile.lastLoginAt ?? null,
          lastActivityAt: profile.lastActivityAt ?? null,
          followUpAt: profile.followUpAt ?? null,
          firstTradedAt: profile.firstTradedAt ?? null,
          lastTradedAt: profile.lastTradedAt ?? null,
          dateConverted: profile.dateConverted ?? profile.convertedAt ?? null,
          conversationAssignedAt: profile.conversationAssignedAt ?? null,
          retentionReview: profile.retentionReview ?? null,
          retentionStatus: profile.retentionStatus ?? null,
          kycStatus: profile.kycStatus ?? null,
          leadStatus: profile.leadStatus ?? null,
          salesReview: profile.salesReview ?? null,

          // ——— Finance KPIs (from entity and aggregation) ———
          // Use entity's existing finance fields as baseline
          totalFtd: profile.totalFtd ?? profile.finance?.ftd?.totalFTD ?? null,
          ftdDate: profile.ftdDate ?? profile.finance?.ftd?.ftdDateISO ?? null,
          ftd: profile.ftd ?? (profile.finance?.ftd?.isFTD ? 1 : null),
          ftdSelf: typeof profile.ftdSelf === 'boolean' ? profile.ftdSelf : 
                  (profile.ftdSelf === 1 ? true : (profile.ftdSelf === 0 ? false : null)),
          daysToFtd: profile.daysToFtd ?? profile.finance?.ftd?.daysToFTD ?? null,
          ftdFirstConversation: profile.ftdFirstConversation ?? null,
          
          // Deposit metrics (use structured finance data if available)
          totalDeposits: profile.finance?.deposit?.totalDeposit ?? null,
          netDeposits: profile.finance?.deposit?.netDeposit ?? null,
          firstDepositDate: profile.finance?.deposit?.firstDepositDateISO ?? null,
          lastDepositDate: profile.finance?.deposit?.lastDepositDateISO ?? null,
          daysToDeposit: profile.finance?.deposit?.daysToDeposit ?? null,
          paymentGateway: tx.paymentMethod ?? null, // Use transaction's payment method
          
          // Withdrawal metrics
          totalWithdrawals: profile.finance?.withdrawal?.totalWithdrawal ?? null,
          netWithdrawals: profile.finance?.withdrawal?.netWithdrawal ?? null,
          firstWithdrawalDate: profile.finance?.withdrawal?.firstWithdrawalDateISO ?? null,
          lastWithdrawalDate: profile.finance?.withdrawal?.lastWithdrawalDateISO ?? null,
          daysToWithdrawal: profile.finance?.withdrawal?.daysToWithdrawal ?? null,
          withdrawFromDeposit: null, // TODO: Calculate if needed
          ftwDate: profile.finance?.ftw?.ftwDateISO ?? null,
          ftwSelf: profile.finance?.ftw?.ftwSelf ?? null,
          
          // Credit metrics
          totalCredits: profile.finance?.credit?.totalCredit ?? null,
          netCredits: profile.finance?.credit?.netCredit ?? null,
          creditsOut: profile.finance?.credit?.totalCreditOut ?? null,
          totalChargebacks: profile.finance?.credit?.totalCreditOut ?? null, // Assuming chargebacks are credit outs
          
          // ——— Compliance / Limits ———
          allowDeposit: profile.allowDeposit ?? null,
          depositLimit: profile.depositLimit ?? null,
          allowWithdraw: profile.allowWithdraw ?? null,
          miniDeposit: profile.miniDeposit ?? null,
          withdrawLimit: profile.withdrawLimit ?? null,
          
          // ——— Transaction Fields (per row) ———
          transactionType: tx.kind ?? null,
          amount: tx.amount ?? null,
          txDate: tx.createdAtISO ?? null, // "Transaction Date"
          description: tx.description ?? null,
          paymentMethod: tx.paymentMethod ?? null,
          createdBy: tx.createdBy ?? null,
          action: null, // TODO: Define what this should be
          
          // ——— KYC / Document Fields ———
          // Use status fields preferentially, falling back to boolean flags
          docIdPassport: profile.idPassportStatus ? (profile.idPassportStatus === 'approved') : 
                        (profile.idDoc ?? profile.passport ?? profile.docs?.idPassportVerified ?? null),
          docProofOfAddress: profile.proofOfAddressStatus ? (profile.proofOfAddressStatus === 'approved') : 
                           (profile.proofOfAddress ?? profile.docs?.proofOfAddressVerified ?? null),
          docCardFront: profile.ccFrontStatus ? (profile.ccFrontStatus === 'approved') : 
                       (profile.ccFront ?? profile.docs?.ccFrontVerified ?? null),
          docCardBack: profile.ccBackStatus ? (profile.ccBackStatus === 'approved') : 
                      (profile.ccBack ?? profile.docs?.ccBackVerified ?? null),

          // Add internal transaction fields for reference
          transactionId: tx.id,
          transactionFtd: tx.ftd,
          transactionFtw: tx.ftw,
        }

        allRows.push(row)
      })
    })

    // Sort by transaction date (newest first)
    return allRows.sort((a, b) => 
      new Date(b.txDate || 0).getTime() - new Date(a.txDate || 0).getTime()
    )
  }
)

export const { addTransaction, clearAllTransactions } = transactionsSlice.actions
export default transactionsSlice.reducer