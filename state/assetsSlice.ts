import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit'
import { RootState } from './store'

export type Asset = {
  id: string
  name: string
  category: string // e.g., "Forex", "Crypto", "Commodities", "Indices"
  enabled: boolean
}

type State = {
  items: Asset[]
  seeded: boolean
}

const DEFAULT_ASSETS: Omit<Asset, 'id'>[] = [
  // Forex
  { name: 'EURUSD', category: 'Forex', enabled: true },
  { name: 'GBPUSD', category: 'Forex', enabled: true },
  { name: 'USDJPY', category: 'Forex', enabled: true },
  { name: 'AUDUSD', category: 'Forex', enabled: true },
  { name: 'USDCAD', category: 'Forex', enabled: true },
  { name: 'USDCHF', category: 'Forex', enabled: true },
  { name: 'NZDUSD', category: 'Forex', enabled: true },
  
  // Crypto
  { name: 'BTCUSD', category: 'Crypto', enabled: true },
  { name: 'ETHUSD', category: 'Crypto', enabled: true },
  { name: 'LTCUSD', category: 'Crypto', enabled: true },
  { name: 'XRPUSD', category: 'Crypto', enabled: true },
  
  // Commodities
  { name: 'XAUUSD', category: 'Commodities', enabled: true },
  { name: 'XAGUSD', category: 'Commodities', enabled: true },
  { name: 'CRUDE', category: 'Commodities', enabled: true },
  { name: 'BRENT', category: 'Commodities', enabled: true },
  
  // Indices
  { name: 'US30', category: 'Indices', enabled: true },
  { name: 'US500', category: 'Indices', enabled: true },
  { name: 'NAS100', category: 'Indices', enabled: true },
  { name: 'GER30', category: 'Indices', enabled: true },
]

const initialState: State = {
  items: [],
  seeded: false,
}

const slice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    seedDefaultsOnce(state) {
      if (state.seeded || state.items.length) return
      state.items = DEFAULT_ASSETS.map(asset => ({
        ...asset,
        id: nanoid(),
      }))
      state.seeded = true
    },
    addAsset: {
      prepare(asset: Omit<Asset, 'id'>) {
        return { payload: { id: nanoid(), ...asset } }
      },
      reducer(state, action: PayloadAction<Asset>) {
        const exists = state.items.some(
          item => item.name.toLowerCase() === action.payload.name.toLowerCase()
        )
        if (exists) return // ignore duplicates by name
        state.items.push(action.payload)
      },
    },
    updateAsset(state, action: PayloadAction<{ id: string; updates: Partial<Omit<Asset, 'id'>> }>) {
      const asset = state.items.find(item => item.id === action.payload.id)
      if (asset) {
        Object.assign(asset, action.payload.updates)
      }
    },
    setAssetEnabled(state, action: PayloadAction<{ id: string; enabled: boolean }>) {
      const asset = state.items.find(item => item.id === action.payload.id)
      if (asset) {
        asset.enabled = action.payload.enabled
      }
    },
    removeAsset(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
  },
})

export const {
  seedDefaultsOnce,
  addAsset,
  updateAsset,
  setAssetEnabled,
  removeAsset,
} = slice.actions

export default slice.reducer

// Selectors
export const selectAllAssets = (state: RootState): Asset[] => state.assets.items

export const selectEnabledAssets = (state: RootState): Asset[] =>
  state.assets.items.filter(asset => asset.enabled)

export const selectAssetsByCategory = (state: RootState, category: string): Asset[] =>
  state.assets.items.filter(asset => asset.category === category)

export const selectAssetById = (state: RootState, id: string): Asset | undefined =>
  state.assets.items.find(asset => asset.id === id)

export const selectAssetOptions = (state: RootState) =>
  state.assets.items
    .filter(asset => asset.enabled)
    .map(asset => ({
      value: asset.id,
      label: `${asset.name} (${asset.category})`,
      category: asset.category,
    }))