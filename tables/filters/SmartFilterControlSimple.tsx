import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import type { NormalizedFilter } from '@/filters/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props<T> = {
  column: Column<T, unknown>;
  schema?: any;
  onApply: (nf: NormalizedFilter) => void;
  onClose?: () => void;
};

export function SmartFilterControlSimple<T>({ column, onApply, onClose }: Props<T>) {
  const [value, setValue] = React.useState('');

  const handleApply = () => {
    if (value.trim()) {
      onApply({ kind: 'text', op: 'contains', value: value.trim() });
    }
    onClose?.();
  };

  const handleClear = () => {
    column.setFilterValue(undefined);
    onClose?.();
  };

  return (
    <div className="p-4 w-80">
      <div className="text-sm font-medium mb-3">
        Filter {typeof column.columnDef.header === 'string' ? column.columnDef.header : String(column.id)}
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Value</label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}