import React from 'react';
import ComplianceFilters from '@/features/compliance/ComplianceFilters';
import SavedViews from '@/features/shared/SavedViews';
import ColumnPicker from '@/features/shared/ColumnPicker';
import ExportButton from '@/features/shared/ExportButton';
import ComplianceTable from '@/features/compliance/ComplianceTable';

export default function CompliancePage() {
  return (
    <div className="w-full">
      {/* Sticky List Header */}
      <div className="sticky top-[var(--app-topbar,64px)] z-30 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold mr-auto">Compliance</h1>
          {/* Search */}
          <div className="relative">
            <input
              placeholder="Search…"
              className="h-9 w-64 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
              // TODO: bind to state -> query
            />
          </div>
          {/* Filter / View / Columns / Export */}
          <ComplianceFilters />
          <SavedViews entityKey="compliance" />
          <ColumnPicker tableId="settings.compliance.v1" />
          <ExportButton entity="compliance" />
        </div>
      </div>
      {/* Table */}
      <div className="mx-auto max-w-[1400px] px-0">
        <ComplianceTable />
      </div>
    </div>
  );
}
