import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/state/store'

export const selectAllGateways = (state: RootState) => state.paymentGateways.items

// Field options for CRM forms - only active gateways
export const selectActivePaymentGatewayOptions = createSelector(
  selectAllGateways,
  (gateways) =>
    gateways
      .filter(gateway => gateway.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(gateway => ({
        value: gateway.id,
        label: gateway.name,
      }))
)

// For showing a picked-but-disabled gateway
export const selectGatewayById = (id: string) => createSelector(
  selectAllGateways,
  (gateways) => gateways.find(gateway => gateway.id === id)
)

// For showing all options including disabled ones (admin use)
export const selectAllPaymentGatewayOptions = createSelector(
  selectAllGateways,
  (gateways) =>
    gateways
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(gateway => ({ 
        value: gateway.id, 
        label: gateway.name,
        isActive: gateway.isActive
      }))
)

// Check if a gateway exists and is active
export const selectIsGatewayValid = (id: string | undefined) => createSelector(
  selectAllGateways,
  (gateways) => {
    if (!id) return true // empty is valid
    const gateway = gateways.find(g => g.id === id)
    return gateway ? gateway.isActive : false // deleted or disabled = invalid
  }
)

// Enhanced options with additional metadata
export const selectPaymentGatewayOptionsWithMetadata = createSelector(
  selectAllGateways,
  (gateways) => 
    gateways
      .filter(gateway => gateway.isActive)
      .map(gateway => ({
        value: gateway.id,
        label: gateway.name,
        provider: gateway.provider,
        currency: gateway.currency,
        availableAmounts: Object.keys(gateway.links).filter(key => gateway.links[key as keyof typeof gateway.links]),
      }))
)

// Get gateway display name by ID
export const selectGatewayDisplayName = createSelector(
  [(state: RootState) => state.paymentGateways.items, (_: RootState, gatewayId: string) => gatewayId],
  (gateways, gatewayId) => {
    const gateway = gateways.find(g => g.id === gatewayId)
    return gateway?.name || 'Unknown Gateway'
  }
)

// Get gateway link for specific amount
export const selectGatewayLinkForAmount = createSelector(
  [
    (state: RootState) => state.paymentGateways.items,
    (_: RootState, gatewayId: string) => gatewayId,
    (_: RootState, __: string, amount: number) => amount,
  ],
  (gateways, gatewayId, amount) => {
    const gateway = gateways.find(g => g.id === gatewayId && g.isActive)
    if (!gateway) return null

    const amountKey = `a${amount}` as keyof typeof gateway.links
    return gateway.links[amountKey] || null
  }
)