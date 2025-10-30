import React, { useState, useMemo } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AccountTypeAssetRule } from '../types/accountTypeAssetRule.schema';
import { useListAssetsQuery } from '../state/accountTypeAssetsApi';

type Props = {
  onAdd: (rules: AccountTypeAssetRule[]) => void;
  existingAssetIds?: string[]; // To prevent duplicates
  accountTypeId?: string; // For generating rule IDs
  isOpen: boolean;
  onClose: () => void;
};

export default function AddAssetDrawer({ onAdd, existingAssetIds = [], accountTypeId, isOpen, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  const { data: assets = [], isLoading } = useListAssetsQuery();

  // Filter assets based on search and category
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const notAlreadyAdded = !existingAssetIds.includes(asset.id);
      return matchesSearch && matchesCategory && notAlreadyAdded;
    });
  }, [assets, searchQuery, selectedCategory, existingAssetIds]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(assets.map(a => a.category)));
    return cats.sort();
  }, [assets]);

  const handleAssetToggle = (assetId: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedAssets.size === 0) {
      toast.error('Please select at least one asset');
      return;
    }

    const selectedAssetData = assets.filter(a => selectedAssets.has(a.id));
    const newRules: AccountTypeAssetRule[] = selectedAssetData.map(asset => ({
      id: `temp-${asset.id}-${Date.now()}`, // Temporary ID for create flow
      accountTypeId: accountTypeId || 'temp',
      assetId: asset.id,
      assetName: asset.name,
      category: asset.category as any,
      
      // Default values
      leverage: 50,
      spread: 20,
      defaultLot: 0.1,
      jump: 0.01,
      minDeal: 0.01,
      maxDeal: 100,
      commission: 0,
      swapLong: -1,
      swapShort: -1,
      status: 'ACTIVE' as const,
    }));

    onAdd(newRules);
    setSelectedAssets(new Set());
    setSearchQuery('');
    setSelectedCategory('all');
    onClose();
    toast.success(`Added ${newRules.length} asset${newRules.length > 1 ? 's' : ''}`);
  };

  const handleClose = () => {
    setSelectedAssets(new Set());
    setSearchQuery('');
    setSelectedCategory('all');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Add Assets
            </h2>
            <p className="text-sm text-gray-500">
              Select assets to add to this account type
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">Loading assets...</div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {existingAssetIds.length === assets.length ? (
                'All available assets have been added'
              ) : searchQuery || selectedCategory !== 'all' ? (
                'No assets match your search criteria'
              ) : (
                'No assets available'
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map(asset => (
                <label
                  key={asset.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssets.has(asset.id)}
                    onChange={() => handleAssetToggle(asset.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.category}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedAssets.size} asset{selectedAssets.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedAssets.size === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedAssets.size > 0 && `(${selectedAssets.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook component for easier usage
type AddAssetButtonProps = {
  onAdd: (rules: AccountTypeAssetRule[]) => void;
  existingAssetIds?: string[];
  accountTypeId?: string;
};

export function AddAssetButton({ onAdd, existingAssetIds, accountTypeId }: AddAssetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Asset
      </button>
      
      <AddAssetDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={onAdd}
        existingAssetIds={existingAssetIds}
        accountTypeId={accountTypeId}
      />
    </>
  );
}