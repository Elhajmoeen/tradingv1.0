/**
 * Test component to verify field options are loading correctly
 * Shows options for language and paymentGateway fields
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, Paper, Chip } from '@mui/material'
import { fieldKit } from '../types/leadFilters'
import { optionsByKey } from '@/fieldkit/options'
import type { RootState } from '@/state/store'

export default function FieldOptionsTest() {
  const state = useSelector((state: RootState) => state)
  
  // Get options for language and paymentGateway
  const languageField = fieldKit.byKey('language')
  const paymentGatewayField = fieldKit.byKey('paymentGateway')
  
  const languageOptions = languageField ? optionsByKey(state, 'language') : []
  const paymentGatewayOptions = paymentGatewayField ? optionsByKey(state, 'paymentGateway') : []

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e0f2fe', border: '1px solid #0288d1' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Field Options Test</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Language Options ({languageOptions.length}):
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {languageOptions.map((option, idx) => (
            <Chip 
              key={idx} 
              label={`${option.label} (${option.value})`} 
              size="small" 
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Payment Gateway Options ({paymentGatewayOptions.length}):
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {paymentGatewayOptions.map((option, idx) => (
            <Chip 
              key={idx} 
              label={`${option.label} (${option.value})`} 
              size="small" 
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          This component only shows in development mode
        </Typography>
      </Box>
    </Paper>
  )
}