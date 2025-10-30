import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useCreateMutation } from '@/state/services/accountTypesApi';
import { useUpsertRulesMutation } from '@/features/accountTypes_next/state/accountTypeAssetsApi';

import AccountTypeForm from '@/features/accountTypes_next/components/AccountTypeForm';
import AccountTypeAssetsTable from '@/features/accountTypes_next/components/AccountTypeAssetsTable';
import { AddAssetButton } from '@/features/accountTypes_next/components/AddAssetDrawer';
import { AccountTypeAssetRule } from '@/features/accountTypes_next/types/accountTypeAssetRule.schema';

export default function NewAccountTypePage() {
  const navigate = useNavigate();
  const [create, { isLoading }] = useCreateMutation();
  const [upsertRules] = useUpsertRulesMutation();
  
  // State for assets
  const [stagedRules, setStagedRules] = useState<AccountTypeAssetRule[]>([]);

  // Helper to merge new rules without duplicates
  const mergeUnique = (existing: AccountTypeAssetRule[], newRules: AccountTypeAssetRule[]) => {
    const existingAssetIds = new Set(existing.map(r => r.assetId));
    const filtered = newRules.filter(r => !existingAssetIds.has(r.assetId));
    return [...existing, ...filtered];
  };

  const handleSubmit = async (data: { 
    name: string; 
    status?: 'ACTIVE'|'DISABLED'; 
    settings?: any 
  }) => {
    try {
      const result = await create(data).unwrap();
      
      // If there are staged rules, save them
      if (stagedRules.length > 0) {
        try {
          // Update rule IDs to use real account type ID
          const rulesWithCorrectId = stagedRules.map(rule => ({
            ...rule,
            accountTypeId: result.id,
            id: `${result.id}-${rule.assetId}-${Date.now()}`
          }));
          
          await upsertRules({ 
            accountTypeId: result.id, 
            rules: rulesWithCorrectId 
          }).unwrap();
          
          toast.success(`Account type "${data.name}" created with ${stagedRules.length} asset${stagedRules.length > 1 ? 's' : ''}`);
        } catch (assetError: any) {
          console.error('Failed to save asset rules:', assetError);
          toast.warning(`Account type created but failed to save assets: ${assetError?.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.success(`Account type "${data.name}" created successfully`);
      }
      
      // Redirect to the settings page of the newly created account type
      navigate(`/management/trading/account-types/${result.id}/settings`);
    } catch (error: any) {
      console.error('Failed to create account type:', error);
      toast.error(error?.data?.message || 'Failed to create account type');
    }
  };

  const handleBack = () => {
    navigate('/management/trading/account-types');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Controls - matching AccountTypeSettingsPage */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              New Account Type
            </h1>
            <p className="text-sm text-gray-500">
              Create a new account type with custom settings and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto">
        <AccountTypeForm onSubmit={handleSubmit} submitting={isLoading} />
        
        {/* Assets Configuration Section - Always Visible */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Assets Configuration
              <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
            </h3>
            <AddAssetButton 
              onAdd={(newRules) => setStagedRules(prev => mergeUnique(prev, newRules))}
              existingAssetIds={stagedRules.map(r => r.assetId)}
            />
          </div>
          <AccountTypeAssetsTable
            initialRules={stagedRules}
            onChange={setStagedRules}
          />
        </div>
      </div>
    </div>
  );
}