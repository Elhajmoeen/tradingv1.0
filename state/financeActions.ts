import { nanoid } from 'nanoid'
import { addTransaction, clearAllTransactions } from '../state/transactionsSlice'
import { applyFTDForClient, applyNonFTDDepositForClient, applyFTWForClient, applyNonFTWWithdrawalForClient, applyCreditForClient, applyCreditOutForClient } from '../state/entitiesSlice'
import type { RootState, AppDispatch } from '../state/store'
import type { PaymentMethod } from '../types/finance'

// Define AppThunk type
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType

export const recordDepositFTDYes =
  (params: {
    clientId: string
    amount: number
    description?: string
    paymentMethod: PaymentMethod
    createdBy: 'CRM' | 'Client'
    createdByName?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const { clientId, amount, description, paymentMethod, createdBy, createdByName } = params
    const nowISO = new Date().toISOString()

    // 1) Write the transaction row
    dispatch(
      addTransaction({
        id: nanoid(),
        clientId,
        kind: 'Deposit',
        amount,
        description,
        paymentMethod,
        ftd: true,              // THIS transaction is the First Time Deposit
        createdBy,
        createdByName,
        createdAtISO: nowISO
      })
    )

    // 2) Update profile FTD metrics IF first time
    const state = getState()
    const client = state.entities.entities.find((e: any) => e.id === clientId)
    
    console.log('💰 FTD Check - Client found:', !!client)
    console.log('💰 FTD Check - Client data:', client ? {
      id: client.id,
      totalFtd: client.totalFtd,
      hasStructuredFTD: !!client.finance?.ftd?.isFTD,
      createdAt: client.createdAt
    } : null)
    
    const alreadyHasFTD = client?.finance?.ftd?.isFTD || (client?.totalFtd && client.totalFtd > 0)
    
    if (client && !alreadyHasFTD) {
      console.log('💰 Applying FTD to client profile...')
      dispatch(
        applyFTDForClient({
          clientId,
          amount,
          ftdDateISO: nowISO,
          createdBy,
          clientCreatedAtISO: client.createdAt || nowISO
        })
      )
    } else {
      console.log('💰 FTD already exists or client not found, skipping profile update')
    }
  }

export const recordDepositFTDNo =
  (params: {
    clientId: string
    amount: number
    description?: string
    paymentMethod: PaymentMethod
    createdBy: 'CRM' | 'Client'
    createdByName?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const { clientId, amount, description, paymentMethod, createdBy, createdByName } = params
    const nowISO = new Date().toISOString()

    // 1) Add transaction row (FTD = false)
    dispatch(
      addTransaction({
        id: nanoid(),
        clientId,
        kind: 'Deposit',
        amount,
        description,
        paymentMethod,
        ftd: false,
        createdBy,
        createdByName,
        createdAtISO: nowISO
      })
    )

    // 2) Update deposit metrics
    const state = getState()
    const client = state.entities.entities.find((e: any) => e.id === clientId)
    const clientCreatedAtISO = client?.createdAt ?? nowISO

    dispatch(
      applyNonFTDDepositForClient({
        clientId,
        amount,
        depositDateISO: nowISO,
        clientCreatedAtISO
      })
    )
    
    console.log('💳 Recorded non-FTD deposit:', { clientId, amount, paymentMethod })
  }

export const recordWithdrawalFTWYes =
  (params: {
    clientId: string
    amount: number
    description?: string
    paymentMethod: PaymentMethod
    createdBy: 'CRM' | 'Client'
    createdByName?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const { clientId, amount, description, paymentMethod, createdBy, createdByName } = params
    const nowISO = new Date().toISOString()

    // 1) Add transaction row (FTW = true)
    dispatch(
      addTransaction({
        id: nanoid(),
        clientId,
        kind: 'Withdraw',
        amount,
        description,
        paymentMethod,
        ftw: true,              // THIS transaction is the First Time Withdrawal
        createdBy,
        createdByName,
        createdAtISO: nowISO
      })
    )

    // 2) Update profile FTW metrics IF first time
    const state = getState()
    const client = state.entities.entities.find((e: any) => e.id === clientId)
    
    console.log('🏦 FTW Check - Client found:', !!client)
    console.log('🏦 FTW Check - Client data:', client ? {
      id: client.id,
      hasStructuredFTW: !!client.finance?.ftw?.isFTW,
      createdAt: client.createdAt
    } : null)
    
    const alreadyHasFTW = client?.finance?.ftw?.isFTW
    
    if (client && !alreadyHasFTW) {
      console.log('🏦 Applying FTW to client profile...')
      dispatch(
        applyFTWForClient({
          clientId,
          amount,
          ftwDateISO: nowISO,
          createdBy,
          clientCreatedAtISO: client.createdAt || nowISO
        })
      )
    } else {
      console.log('🏦 FTW already exists or client not found, skipping profile update')
    }

    // 3) Also update withdrawal metrics (both FTW and non-FTW withdrawals affect totals)
    const clientCreatedAtISO = client?.createdAt ?? nowISO
    dispatch(
      applyNonFTWWithdrawalForClient({
        clientId,
        amount,
        withdrawalDateISO: nowISO,
        clientCreatedAtISO
      })
    )
    
    console.log('🏦 Recorded FTW withdrawal:', { clientId, amount, paymentMethod })
  }

export const recordWithdrawalFTWNo =
  (params: {
    clientId: string
    amount: number
    description?: string
    paymentMethod: PaymentMethod
    createdBy: 'CRM' | 'Client'
    createdByName?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const { clientId, amount, description, paymentMethod, createdBy, createdByName } = params
    const nowISO = new Date().toISOString()

    // 1) Add transaction row (FTW = false)
    dispatch(
      addTransaction({
        id: nanoid(),
        clientId,
        kind: 'Withdraw',
        amount,
        description,
        paymentMethod,
        ftw: false,
        createdBy,
        createdByName,
        createdAtISO: nowISO
      })
    )

    // 2) Update withdrawal metrics
    const state = getState()
    const client = state.entities.entities.find((e: any) => e.id === clientId)
    const clientCreatedAtISO = client?.createdAt ?? nowISO

    dispatch(
      applyNonFTWWithdrawalForClient({
        clientId,
        amount,
        withdrawalDateISO: nowISO,
        clientCreatedAtISO
      })
    )
    
    console.log('🏦 Recorded non-FTW withdrawal:', { clientId, amount, paymentMethod })
  }

// Legacy function for backward compatibility
export const recordWithdrawal = recordWithdrawalFTWNo

export const recordCredit =
  (params: {
    clientId: string
    amount: number
    description?: string
    paymentMethod: PaymentMethod
    createdBy: 'CRM' | 'Client'
    createdByName?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const { clientId, amount, description, paymentMethod, createdBy, createdByName } = params
    const nowISO = new Date().toISOString()

    // 1) Write the transaction row
    dispatch(
      addTransaction({
        id: nanoid(),
        clientId,
        kind: 'Credit',
        amount,
        description,
        paymentMethod,
        createdBy,
        createdByName,
        createdAtISO: nowISO
      })
    )

    // 2) Update client's credit metrics
    const state = getState()
    const client = state.entities.entities.find((e: any) => e.id === clientId)
    
    if (client) {
      dispatch(applyCreditForClient({
        clientId,
        amount,
        creditDateISO: nowISO,
        clientCreatedAtISO: client.createdAt || nowISO
      }))
    }
    
    console.log('➕ Recorded credit:', { clientId, amount, paymentMethod })
  }

export const recordCreditOut =
  (params: {
    clientId: string
    amount: number
    description?: string
    paymentMethod: PaymentMethod
    createdBy: 'CRM' | 'Client'
    createdByName?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const { clientId, amount, description, paymentMethod, createdBy, createdByName } = params
    const nowISO = new Date().toISOString()

    // First check if client has enough credits
    const state = getState()
    const client = state.entities.entities.find((e: any) => e.id === clientId)
    
    if (client) {
      const currentTotalCredit = client.finance?.credit?.totalCredit || 0
      const currentTotalCreditOut = client.finance?.credit?.totalCreditOut || 0
      const availableCredit = currentTotalCredit - currentTotalCreditOut

      if (amount > availableCredit) {
        console.warn('❌ Credit Out amount exceeds available credits:', {
          requestedAmount: amount,
          availableCredit: availableCredit,
          totalCredit: currentTotalCredit,
          totalCreditOut: currentTotalCreditOut
        })
        
        // Throw an error to prevent the transaction
        throw new Error(`Insufficient credits. Available: ${availableCredit}, Requested: ${amount}`)
      }
    }

    // 1) Write the transaction row
    dispatch(
      addTransaction({
        id: nanoid(),
        clientId,
        kind: 'Credit Out',
        amount,
        description,
        paymentMethod,
        createdBy,
        createdByName,
        createdAtISO: nowISO
      })
    )

    // 2) Update client's credit out metrics
    if (client) {
      dispatch(applyCreditOutForClient({
        clientId,
        amount,
        creditOutDateISO: nowISO,
        clientCreatedAtISO: client.createdAt || nowISO
      }))
    }
    
    console.log('➖ Recorded credit out:', { clientId, amount, paymentMethod })
  }

// Initialize clean finance system (remove any fake data)
export const initializeFinanceSystem =
  (): AppThunk =>
  (dispatch, getState) => {
    console.log('🚀 Initializing clean finance system...')
    
    // Clear any fake transactions
    dispatch(clearAllTransactions())
    
    console.log('✅ Finance system initialized with clean state')
  }