import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { EntityTable, type EntityTableConfig } from '../components/EntityTable';
import { ListHeaderBar } from '../components/ListHeaderBar';
import { ColumnsDrawer } from '../components/ColumnsDrawer';
import { ViewsMenu } from '../components/ViewsMenu';
import { selectClosedPositionsEntityRows } from '../state/positionsSlice';
import { closedPositionsAllColumns } from '../config/positionColumns';
import { Button as MUIButton } from '@mui/material';
import { Columns, SquaresFour } from '@phosphor-icons/react';

// Storage key for column visibility preferences
const STORAGE_KEY = 'closed-positions.columns.v1';

export const ClosedPositionsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  
  // Column visibility state with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Default to columns marked as defaultVisible
    const defaultVisible: Record<string, boolean> = {};
    closedPositionsAllColumns.forEach(col => {
      defaultVisible[col.id] = col.defaultVisible ?? false;
    });
    return defaultVisible;
  });

  // Column order state with localStorage persistence
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const orderKey = `${STORAGE_KEY}.order`;
    const saved = localStorage.getItem(orderKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return closedPositionsAllColumns.map(col => col.id);
  });

  // Get all closed positions with profile data
  const closedPositionsData = useSelector(selectClosedPositionsEntityRows);

  // EntityTable configuration
  const tableConfig: EntityTableConfig = useMemo(() => ({
    entityType: 'closed-position',
    entityNameSingular: 'closed position',
    entityNamePlural: 'closed positions',
    columns: closedPositionsAllColumns,
    storageKey: 'closed-positions'
  }), []);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!query.trim()) return closedPositionsData;

    const searchTerm = query.toLowerCase();
    return closedPositionsData.filter(row => {
      // Search across key fields
      const searchableFields = [
        row.accountId,
        row.firstName,
        row.lastName,
        row.email,
        row.instrument,
        row.closedId,
        row.desk,
        row.retentionManager,
      ];
      
      return searchableFields.some(field => 
        field?.toString().toLowerCase().includes(searchTerm)
      );
    });
  }, [closedPositionsData, query]);

  // Column management functions
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      const updated = { ...prev, [columnId]: visible };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    const orderKey = `${STORAGE_KEY}.order`;
    localStorage.setItem(orderKey, JSON.stringify(newOrder));
  };

  const handleSelectAllColumns = () => {
    const allVisible: Record<string, boolean> = {};
    closedPositionsAllColumns.forEach(col => {
      allVisible[col.id] = true;
    });
    setVisibleColumns(allVisible);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisible));
  };

  const handleClearAllColumns = () => {
    const allHidden: Record<string, boolean> = {};
    closedPositionsAllColumns.forEach(col => {
      allHidden[col.id] = false;
    });
    setVisibleColumns(allHidden);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHidden));
  };

  const handleResetToDefault = () => {
    const defaultVisible: Record<string, boolean> = {};
    closedPositionsAllColumns.forEach(col => {
      defaultVisible[col.id] = col.defaultVisible ?? false;
    });
    setVisibleColumns(defaultVisible);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisible));
  };

  // Export function
  const handleExport = () => {
    // Get visible columns in order
    const visibleColumnIds = columnOrder.filter(colId => visibleColumns[colId]);
    const visibleOrderedColumns = visibleColumnIds
      .map(colId => closedPositionsAllColumns.find(col => col.id === colId))
      .filter(Boolean);

    const headers = visibleOrderedColumns.map(col => col!.header).join(',');
    const rows = filteredData.map(row => 
      visibleOrderedColumns.map(col => {
        const value = row[col!.path as keyof typeof row];
        const stringValue = value?.toString() || '';
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `closed-positions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleActions = {
    onExport: handleExport
  };

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0">
        <ListHeaderBar
          onSearch={setQuery}
          actions={handleActions}
          entityNamePlural="closed positions"
          columnsDrawer={
            <ColumnsDrawer
              columns={closedPositionsAllColumns}
              visibleColumns={visibleColumns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onColumnOrderChange={handleColumnOrderChange}
              onSelectAll={handleSelectAllColumns}
              onClearAll={handleClearAllColumns}
              onResetToDefault={handleResetToDefault}
            >
              <MUIButton 
                variant="outlined"
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '0.5rem',
                  textTransform: 'none',
                  gap: 0.5,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Columns size={12} />
                Columns
              </MUIButton>
            </ColumnsDrawer>
          }
        />
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        <EntityTable 
          rows={filteredData} 
          config={tableConfig}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onColumnOrderChange={handleColumnOrderChange}
        />
      </div>
    </div>
  );
};