import { createSlice, PayloadAction, nanoid, createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

export type AccountType = {
  id: string;
  name: string;
  isActive: boolean;   // soft delete / disable-safe
  createdAt: string;
  createdBy?: string;  // who created this account type
  defaults: {
    blockNotifications: boolean;
    allowedToTrade: boolean;
    allowDeposit: boolean;
    allowWithdraw: boolean;
    tradeOut: boolean;
    marginCall: number; // percent or normalized value
  };
};

type State = {
  items: AccountType[];
  seeded: boolean;
};

const DEFAULT_TYPES = [
  'Micro Mini',
  'Mini',
  'Standard',
  'Gold',
  'Diamond',
  'VIP',
];

const initialState: State = {
  items: [],
  seeded: false,
};

const slice = createSlice({
  name: 'accountTypes',
  initialState,
  reducers: {
    seedDefaultsOnce(state) {
      if (state.seeded || state.items.length) return;
      state.items = DEFAULT_TYPES.map(name => ({
        id: nanoid(),
        name,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        defaults: {
          blockNotifications: false,
          allowedToTrade: true,
          allowDeposit: true,
          allowWithdraw: true,
          tradeOut: false,
          marginCall: 80,
        },
      }));
      state.seeded = true;
    },
    addAccountType: {
      prepare(name: string) {
        return { payload: { id: nanoid(), name } };
      },
      reducer(state, action: PayloadAction<{ id: string; name: string }>) {
        const exists = state.items.some(
          t => t.name.trim().toLowerCase() === action.payload.name.trim().toLowerCase()
        );
        if (exists) return; // ignore duplicates by name
        state.items.push({
          id: action.payload.id,
          name: action.payload.name.trim(),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'Admin', // For now, defaulting to Admin - can be enhanced later
          defaults: {
            blockNotifications: false,
            allowedToTrade: true,
            allowDeposit: true,
            allowWithdraw: true,
            tradeOut: false,
            marginCall: 80,
          },
        });
      },
    },
    renameAccountType(state, action: PayloadAction<{ id: string; name: string }>) {
      const item = state.items.find(t => t.id === action.payload.id);
      if (item) item.name = action.payload.name.trim();
    },
    setAccountTypeActive(state, action: PayloadAction<{ id: string; isActive: boolean }>) {
      const item = state.items.find(t => t.id === action.payload.id);
      if (item) item.isActive = action.payload.isActive;
    },
    updateAccountTypeDefaults(state, action: PayloadAction<{ id: string; patch: Partial<AccountType['defaults']> }>) {
      const item = state.items.find(t => t.id === action.payload.id);
      if (item) {
        Object.assign(item.defaults, action.payload.patch);
      }
    },
    deleteAccountType(state, action: PayloadAction<{ id: string }>) {
      // hard delete (use with care). Prefer disabling via setAccountTypeActive.
      state.items = state.items.filter(t => t.id !== action.payload.id);
    },
  },
});

export const {
  seedDefaultsOnce,
  addAccountType,
  renameAccountType,
  setAccountTypeActive,
  updateAccountTypeDefaults,
  deleteAccountType,
} = slice.actions;

export default slice.reducer;

/** Selectors */
export const selectAccountTypes = (s: RootState) => s.accountTypes.items;
export const selectActiveAccountTypes = createSelector(selectAccountTypes, items =>
  items.filter(i => i.isActive)
);

/** Dropdown options */
export const selectAccountTypeOptions = createSelector(selectActiveAccountTypes, items =>
  items.map(i => ({ value: i.name, label: i.name }))
);