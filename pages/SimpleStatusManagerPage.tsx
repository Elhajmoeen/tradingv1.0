import { useState } from "react";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download } from '@phosphor-icons/react';
import { useStatusStore } from "@/features/lookups/state/useStatusStore";
import StatusManagerTable from "@/components/StatusManagerTable";
import { AddStatusModal, EditStatusModal } from "@/features/lookups/StatusModals";

type LookupCategoryKey = "kycStatus" | "leadStatus" | "retentionStatus";

interface LookupValue {
  id: string;
  key: string;
  label: string;
  color?: string | null;
  order: number;
  active: boolean;
  deprecatedAt?: string | null;
  usageCount?: number;
}

const CATEGORIES: { label: string; value: LookupCategoryKey }[] = [
  { label: "KYC Status", value: "kycStatus" },
  { label: "Lead Status", value: "leadStatus" },
  { label: "Retention Status", value: "retentionStatus" },
];

export default function SimpleStatusManagerPage() {
  const [category, setCategory] = useState<LookupCategoryKey>("kycStatus");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<LookupValue | null>(null);

  // Use Zustand store
  const items = useStatusStore(state => state[category]);
  const addValue = useStatusStore(state => state.addValue);
  const updateValue = useStatusStore(state => state.updateValue);
  const toggleActive = useStatusStore(state => state.toggleActive);
  const reorder = useStatusStore(state => state.reorder);
  const deprecate = useStatusStore(state => state.deprecate);

  // Get current category label
  const currentCategoryLabel = CATEGORIES.find(cat => cat.value === category)?.label || "Status";

  // Event handlers
  const handleAdd = (value: Omit<LookupValue, 'id' | 'order'>) => {
    addValue(category, value);
  };

  const handleEdit = (status: LookupValue) => {
    setEditingStatus(status);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (id: string, updates: Partial<LookupValue>) => {
    updateValue(category, id, updates);
    setIsEditModalOpen(false);
    setEditingStatus(null);
  };

  const handleToggleActive = (id: string, active: boolean) => {
    toggleActive(category, id, active);
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    const sortedItems = items.slice().sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex(item => item.id === id);
    if (currentIndex < 0) return;
    
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= sortedItems.length) return;

    reorder(category, currentIndex, newIndex);
  };

  const handleDeprecate = (id: string) => {
    const status = items.find(item => item.id === id);
    if (!status) return;

    if (confirm(`Are you sure you want to deprecate "${status.label}"? It will be hidden from selectors but preserved in data.`)) {
      deprecate(category, id);
    }
  };

  const handleExport = () => {
    try {
      const headers = ['Order', 'Key', 'Label', 'Color', 'Status', 'Usage Count', 'Created'];
      const rows = items.map(item => [
        item.order,
        item.key,
        item.label,
        item.color || '',
        item.active ? 'Active' : 'Inactive',
        item.usageCount || 0,
        item.deprecatedAt ? `Deprecated ${new Date(item.deprecatedAt).toLocaleDateString()}` : 'Active'
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${category}-statuses.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${items.length} ${currentCategoryLabel.toLowerCase()} statuses`);
    } catch (error) {
      toast.error('Failed to export statuses');
    }
  };

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Status Manager</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage {currentCategoryLabel.toLowerCase()} values for CRM fields
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Category Selector */}
              <Select value={category} onValueChange={(v) => setCategory(v as LookupCategoryKey)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <Button
                variant="outline"
                onClick={handleExport}
                className="inline-flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export
              </Button>
              
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Add Status
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="flex-1 overflow-hidden w-full">
        <StatusManagerTable
          category={category}
          data={items}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onMove={handleMove}
          onDeprecate={handleDeprecate}
        />
      </div>

      {/* Modals */}
      <AddStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
        category={currentCategoryLabel}
      />

      <EditStatusModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStatus(null);
        }}
        onUpdate={handleUpdate}
        status={editingStatus}
        category={currentCategoryLabel}
      />
    </div>
  );
}