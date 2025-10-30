import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { RootState } from './store'

export type AccountTypeAssetRule = {
  assetId: string
  assetName: string      // denormalized for UX; keep in sync from assetsSlice on add
  category: string       // e.g., "Forex", "Crypto"
  leverage: number       // e.g., 30, 50, 100
  spread: number         // in points/pips (class-aware)
  defaultSize: number    // ticket default amount
  stepSize: number       // Jump increment
  minSize: number        // Mini deal size
  maxSize: number        // Max deal size
  commissionType: 'perLot' | 'perNotional' // keep flexible
  commissionValue: number
  swapLong: number       // daily points/%
  swapShort: number      // daily points/%
  enabled: boolean
  updatedAt: string
}

type RulesByAssetId = Record<string, AccountTypeAssetRule>
type State = Record<string, RulesByAssetId> // accountTypeId -> rules

const initialState: State = {}

const slice = createSlice({
  name: 'accountTypeAssetRules',
  initialState,
  reducers: {
    upsertRule(state, action: PayloadAction<{ accountTypeId: string; rule: AccountTypeAssetRule }>) {
      const { accountTypeId, rule } = action.payload
      
      if (!state[accountTypeId]) {
        state[accountTypeId] = {}
      }
      
      state[accountTypeId][rule.assetId] = {
        ...rule,
        updatedAt: new Date().toISOString(),
      }
    },
    
    removeRule(state, action: PayloadAction<{ accountTypeId: string; assetId: string }>) {
      const { accountTypeId, assetId } = action.payload
      
      if (state[accountTypeId]) {
        delete state[accountTypeId][assetId]
        
        // Clean up empty account type entries
        if (Object.keys(state[accountTypeId]).length === 0) {
          delete state[accountTypeId]
        }
      }
    },
    
    setRuleEnabled(state, action: PayloadAction<{ accountTypeId: string; assetId: string; enabled: boolean }>) {
      const { accountTypeId, assetId, enabled } = action.payload
      
      if (state[accountTypeId]?.[assetId]) {
        state[accountTypeId][assetId].enabled = enabled
        state[accountTypeId][assetId].updatedAt = new Date().toISOString()
      }
    },
    
    bulkUpsertForAccountType(state, action: PayloadAction<{ accountTypeId: string; rules: AccountTypeAssetRule[] }>) {
      const { accountTypeId, rules } = action.payload
      const now = new Date().toISOString()
      
      if (!state[accountTypeId]) {
        state[accountTypeId] = {}
      }
      
      rules.forEach(rule => {
        state[accountTypeId][rule.assetId] = {
          ...rule,
          updatedAt: now,
        }
      })
    },
    
    syncAssetMeta(state, action: PayloadAction<{ assetId: string; name: string; category: string }>) {
      const { assetId, name, category } = action.payload
      
      // Update denormalized fields across all account types
      Object.values(state).forEach(accountTypeRules => {
        if (accountTypeRules[assetId]) {
          accountTypeRules[assetId].assetName = name
          accountTypeRules[assetId].category = category
          accountTypeRules[assetId].updatedAt = new Date().toISOString()
        }
      })
    },
    
    updateRuleField(state, action: PayloadAction<{ 
      accountTypeId: string
      assetId: string
      field: keyof Omit<AccountTypeAssetRule, 'assetId' | 'updatedAt'>
      value: any 
    }>) {
      const { accountTypeId, assetId, field, value } = action.payload
      
      if (state[accountTypeId]?.[assetId]) {
        // @ts-ignore - we know the field exists
        state[accountTypeId][assetId][field] = value
        state[accountTypeId][assetId].updatedAt = new Date().toISOString()
      }
    },
  },
})

export const {
  upsertRule,
  removeRule,
  setRuleEnabled,
  bulkUpsertForAccountType,
  syncAssetMeta,
  updateRuleField,
} = slice.actions

export default slice.reducer

// Selectors
export const selectRulesForAccountType = createSelector(
  [(state: RootState) => state.accountTypeAssetRules, (_: RootState, accountTypeId: string) => accountTypeId],
  (rules, accountTypeId): AccountTypeAssetRule[] => {
    const accountRules = rules[accountTypeId]
    if (!accountRules) return []
    
    return Object.values(accountRules).sort((a: AccountTypeAssetRule, b: AccountTypeAssetRule) => 
      a.assetName.localeCompare(b.assetName)
    )
  }
)

export const selectRule = createSelector(
  [
    (state: RootState) => state.accountTypeAssetRules,
    (_: RootState, accountTypeId: string) => accountTypeId,
    (_: RootState, __: string, assetId: string) => assetId,
  ],
  (rules, accountTypeId, assetId): AccountTypeAssetRule | undefined => {
    return rules[accountTypeId]?.[assetId]
  }
)

export const selectAllRules = (state: RootState): AccountTypeAssetRule[] => {
  const allRules: AccountTypeAssetRule[] = []
  
  Object.values(state.accountTypeAssetRules).forEach(accountRules => {
    Object.values(accountRules as RulesByAssetId).forEach((rule: AccountTypeAssetRule) => {
      allRules.push(rule)
    })
  })
  
  return allRules.sort((a, b) => a.assetName.localeCompare(b.assetName))
}

// Helper to create a rule with sensible defaults
export const createDefaultRule = (
  assetId: string, 
  assetName: string, 
  category: string
): AccountTypeAssetRule => ({
  assetId,
  assetName,
  category,
  leverage: category === 'Forex' ? 100 : category === 'Crypto' ? 50 : category === 'Commodities' ? 30 : 50,
  spread: category === 'Forex' ? 2 : category === 'Crypto' ? 50 : category === 'Commodities' ? 5 : 20,
  defaultSize: category === 'Forex' ? 0.1 : category === 'Crypto' ? 0.01 : category === 'Commodities' ? 0.1 : 0.1,
  stepSize: category === 'Forex' ? 0.01 : category === 'Crypto' ? 0.001 : 0.01,
  minSize: category === 'Forex' ? 0.01 : category === 'Crypto' ? 0.001 : 0.01,
  maxSize: category === 'Forex' ? 100 : category === 'Crypto' ? 10 : category === 'Commodities' ? 50 : 100,
  commissionType: 'perLot',
  commissionValue: 0,
  swapLong: category === 'Forex' ? -2.5 : category === 'Crypto' ? 0 : -1,
  swapShort: category === 'Forex' ? -1.5 : category === 'Crypto' ? 0 : -1,
  enabled: true,
  updatedAt: new Date().toISOString(),
})

// Action to seed default rules for account types
export const seedDefaultRulesForAccountType = (accountTypeId: string, assets: Array<{id: string, name: string, category: string}>) => {
  return bulkUpsertForAccountType({
    accountTypeId,
    rules: [
      // Add some popular assets with good defaults
      ...assets.slice(0, 8).map(asset => createDefaultRule(asset.id, asset.name, asset.category))
    ]
  })
}