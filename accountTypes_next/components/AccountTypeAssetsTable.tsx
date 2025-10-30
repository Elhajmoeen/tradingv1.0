import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AccountTypeAssetRule } from '../types/accountTypeAssetRule.schema';
import { useListRulesQuery, useUpsertRulesMutation, useDeleteRuleMutation } from '../state/accountTypeAssetsApi';

type Props = {
  accountTypeId?: string;              // undefined on "Create"
  initialRules?: AccountTypeAssetRule[];
  onChange?: (rules: AccountTypeAssetRule[]) => void; // for Create flow
};

export default function AccountTypeAssetsTable({ accountTypeId, initialRules = [], onChange }: Props) {
  const [localRules, setLocalRules] = useState<AccountTypeAssetRule[]>(initialRules);
  const [editingCell, setEditingCell] = useState<{ ruleId: string; field: string } | null>(null);
  
  // For edit mode - fetch from API
  const { data: apiRules, isLoading } = useListRulesQuery(accountTypeId!, { 
    skip: !accountTypeId 
  });
  
  const [upsertRules] = useUpsertRulesMutation();
  const [deleteRule] = useDeleteRuleMutation();

  // Use API data when available, otherwise local state
  const rules = useMemo(() => {
    return accountTypeId ? (apiRules || []) : localRules;
  }, [accountTypeId, apiRules, localRules]);

  // Update local state when initial rules change (create flow)
  useEffect(() => {
    if (!accountTypeId) {
      setLocalRules(initialRules);
    }
  }, [initialRules, accountTypeId]);

  // Debounced save function
  const saveRule = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (updatedRule: AccountTypeAssetRule) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (accountTypeId) {
          // Edit mode - save to API
          try {
            await upsertRules({
              accountTypeId,
              rules: rules.map(r => r.id === updatedRule.id ? updatedRule : r)
            }).unwrap();
            toast.success('Rule updated successfully');
          } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update rule');
          }
        } else {
          // Create mode - update local state and notify parent
          const updated = localRules.map(r => r.id === updatedRule.id ? updatedRule : r);
          setLocalRules(updated);
          onChange?.(updated);
        }
      }, 500);
    };
  }, [accountTypeId, rules, localRules, upsertRules, onChange]);

  const handleFieldChange = (rule: AccountTypeAssetRule, field: keyof AccountTypeAssetRule, value: any) => {
    const updatedRule = { ...rule, [field]: value };
    saveRule(updatedRule);
  };

  const handleToggleStatus = async (rule: AccountTypeAssetRule) => {
    const newStatus: 'ACTIVE' | 'DISABLED' = rule.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const updatedRule: AccountTypeAssetRule = { ...rule, status: newStatus };
    
    if (accountTypeId) {
      try {
        await upsertRules({
          accountTypeId,
          rules: rules.map(r => r.id === rule.id ? updatedRule : r)
        }).unwrap();
        toast.success(`Rule ${newStatus.toLowerCase()} successfully`);
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to toggle status');
      }
    } else {
      const updated = localRules.map(r => r.id === rule.id ? updatedRule : r);
      setLocalRules(updated);
      onChange?.(updated);
    }
  };

  const handleDeleteRule = async (rule: AccountTypeAssetRule) => {
    if (!window.confirm(`Remove ${rule.assetName} from this account type?`)) return;

    if (accountTypeId) {
      try {
        await deleteRule({ accountTypeId, ruleId: rule.id }).unwrap();
        toast.success('Asset rule removed successfully');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to remove rule');
      }
    } else {
      const updated = localRules.filter(r => r.id !== rule.id);
      setLocalRules(updated);
      onChange?.(updated);
    }
  };

  const EditableCell = ({ rule, field, type = 'number' }: { rule: AccountTypeAssetRule; field: keyof AccountTypeAssetRule; type?: string }) => {
    const isEditing = editingCell?.ruleId === rule.id && editingCell?.field === field;
    const value = rule[field];

    if (isEditing) {
      return (
        <input
          type={type}
          defaultValue={String(value)}
          className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          onBlur={(e) => {
            const newValue = type === 'number' ? Number(e.target.value) || 0 : e.target.value;
            handleFieldChange(rule, field, newValue);
            setEditingCell(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newValue = type === 'number' ? Number(e.currentTarget.value) || 0 : e.currentTarget.value;
              handleFieldChange(rule, field, newValue);
              setEditingCell(null);
            }
            if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          autoFocus
        />
      );
    }

    return (
      <div
        className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 rounded"
        onClick={() => setEditingCell({ ruleId: rule.id, field })}
      >
        {String(value)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="animate-pulse text-gray-500">Loading asset rules...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Assets Configuration ({rules.length})
        </h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Asset Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Leverage</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Spread</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Default</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Jump</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Mini Deal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Max Deal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Commission</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Swap Long</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Swap Short</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-8 text-gray-500">
                  No assets configured. Click "Add Asset" to get started.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{rule.assetName}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.category}</td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="leverage" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="spread" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="defaultLot" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="jump" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="minDeal" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="maxDeal" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="commission" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="swapLong" />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell rule={rule} field="swapShort" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      rule.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(rule)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title={rule.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      >
                        {rule.status === 'ACTIVE' ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}