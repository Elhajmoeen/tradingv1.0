import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import { inferFilterMeta } from '@/filters/infer';
import type { NormalizedFilter } from '@/filters/types';
import { RELATION_CATALOG } from '@/filters/relationCatalog';
// We'll implement API fetching later or use existing services
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type Props<T> = {
  column: Column<T, unknown>;
  schema?: any; // Zod object for the entity (optional but preferred)
  onApply: (nf: NormalizedFilter) => void;
  onClose?: () => void;
};

export function SmartFilterControl<T>({ column, schema, onApply, onClose }: Props<T>) {
  const fieldKey = String(column.id);
  const zod = schema?.shape?.[fieldKey];
  const meta = React.useMemo(() => {
    return (column.columnDef as any).filterMeta ?? inferFilterMeta(fieldKey, zod);
  }, [fieldKey, zod]);

  // ALL HOOKS MUST BE CALLED IN SAME ORDER ALWAYS
  // Local state for fallback filter
  const [fallbackValue, setFallbackValue] = React.useState('');
  
  // Local state shared across kinds (always initialize)
  const [op, setOp] = React.useState<any>(meta ? (meta as any).ops?.[0] : null);
  const [text, setText] = React.useState('');
  const [numA, setNumA] = React.useState<number | ''>('');
  const [numB, setNumB] = React.useState<number | ''>('');
  const [dateA, setDateA] = React.useState<string>('');
  const [dateB, setDateB] = React.useState<string>('');
  const [options, setOptions] = React.useState<{value:string;label:string}[]>([]);
  const [selected, setSelected] = React.useState<string[] | string>(
    meta && meta.kind === 'enum' && (meta as any).multi ? [] : ''
  );
  const [boolValue, setBoolValue] = React.useState<boolean>(false);

  // If we cannot infer, show simple fallback
  if (!meta) {
    const handleApplyFallback = () => {
      const value = fallbackValue.trim();
      if (value) {
        // Apply as simple text filter
        column.setFilterValue(value);
      } else {
        column.setFilterValue(undefined);
      }
      onClose?.();
    };

    return (
      <div className="p-4 w-80">
        <div className="text-sm font-medium mb-3">
          Filter {typeof column.columnDef.header === 'string' ? column.columnDef.header : fieldKey}
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Value</label>
            <Input
              value={fallbackValue}
              onChange={(e) => setFallbackValue(e.target.value)}
              placeholder="Enter value..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { column.setFilterValue(undefined); onClose?.(); }} className="flex-1">
              Clear
            </Button>
            <Button onClick={handleApplyFallback} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    if (meta && meta.kind === 'enum') {
      setOptions(meta.options);
    } else if (meta && meta.kind === 'relation') {
      // For now, use mock data - can be connected to real API later
      const mockRelationData = {
        conversationOwnerId: [
          { value: 'user1', label: 'John Smith' },
          { value: 'user2', label: 'Jane Doe' },
          { value: 'user3', label: 'Mike Wilson' }
        ],
        accountTypeId: [
          { value: 'demo', label: 'Demo' },
          { value: 'live', label: 'Live' },
          { value: 'vip', label: 'VIP' }
        ]
      };
      const data = mockRelationData[meta.relationKey as keyof typeof mockRelationData] || [];
      setOptions(data);
    }
  }, [meta]);

  const apply = () => {
    let payload: NormalizedFilter;
    switch (meta.kind) {
      case 'text':
        if (!text.trim()) return;
        payload = { kind:'text', op, value: text.trim() }; 
        break;
      case 'number':
        if (op === 'between') {
          if (numA === '' || numB === '') return;
          payload = { kind:'number', op, value: [Number(numA), Number(numB)] };
        } else {
          if (numA === '') return;
          payload = { kind:'number', op, value: Number(numA) };
        }
        break;
      case 'date':
        if (op === 'between') {
          if (!dateA || !dateB) return;
          payload = { kind:'date', op, value: [dateA, dateB] };
        } else {
          if (!dateA) return;
          payload = { kind:'date', op, value: dateA };
        }
        break;
      case 'boolean':
        payload = { kind:'boolean', op:'eq', value: boolValue };
        break;
      case 'enum':
        if (Array.isArray(selected) && selected.length === 0) return;
        if (typeof selected === 'string' && !selected) return;
        payload = { kind:'enum', op: Array.isArray(selected) ? 'in' : 'eq', value: selected };
        break;
      case 'relation':
        if (Array.isArray(selected) && selected.length === 0) return;
        if (typeof selected === 'string' && !selected) return;
        payload = { kind:'relation', op: Array.isArray(selected) ? 'in' : 'eq', value: selected, labelKey: (RELATION_CATALOG as any)[meta.relationKey]?.label };
        break;
      default:
        return;
    }
    onApply(payload);
    onClose?.();
  };

  const clear = () => {
    column.setFilterValue(undefined);
    onClose?.();
  };

  // Render per kind (keep it minimal; use your DS widgets)
  return (
    <div className="space-y-3 p-4 w-80">
      <div className="text-sm font-medium">
        Filter {typeof column.columnDef.header === 'string' ? column.columnDef.header : fieldKey}
      </div>
      
      {'ops' in meta && meta.ops?.length > 1 && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">Condition</label>
          <Select value={op} onValueChange={setOp}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(meta as any).ops.map((o: string) => (
                <SelectItem key={o} value={o}>
                  {o === 'contains' ? 'Contains' : 
                   o === 'eq' ? 'Equals' :
                   o === 'startsWith' ? 'Starts with' :
                   o === 'endsWith' ? 'Ends with' :
                   o === 'gte' ? 'Greater than or equal' :
                   o === 'lte' ? 'Less than or equal' :
                   o === 'between' ? 'Between' :
                   o === 'in' ? 'In' : o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {meta.kind === 'text' && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">Value</label>
          <Input 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Enter text..." 
          />
        </div>
      )}

      {meta.kind === 'number' && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            {op === 'between' ? 'Range' : 'Value'}
          </label>
          {op === 'between' ? (
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={numA} 
                onChange={e => setNumA(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="Min"
              />
              <Input 
                type="number" 
                value={numB} 
                onChange={e => setNumB(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="Max"
              />
            </div>
          ) : (
            <Input 
              type="number" 
              value={numA} 
              onChange={e => setNumA(e.target.value === '' ? '' : Number(e.target.value))} 
              placeholder="Enter number"
            />
          )}
        </div>
      )}

      {meta.kind === 'date' && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            {op === 'between' ? 'Date Range' : 'Date'}
          </label>
          {op === 'between' ? (
            <div className="flex gap-2">
              <Input 
                type="datetime-local" 
                value={dateA} 
                onChange={e => setDateA(e.target.value)} 
              />
              <Input 
                type="datetime-local" 
                value={dateB} 
                onChange={e => setDateB(e.target.value)} 
              />
            </div>
          ) : (
            <Input 
              type="datetime-local" 
              value={dateA} 
              onChange={e => setDateA(e.target.value)} 
            />
          )}
        </div>
      )}

      {meta.kind === 'boolean' && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">Value</label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="bool-value"
              checked={boolValue}
              onCheckedChange={(checked) => setBoolValue(checked === true)}
            />
            <label htmlFor="bool-value" className="text-sm">
              {boolValue ? 'True' : 'False'}
            </label>
          </div>
        </div>
      )}

      {(meta.kind === 'enum' || meta.kind === 'relation') && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            {(meta as any).multi ? 'Select values' : 'Select value'}
          </label>
          {(meta as any).multi ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${option.value}`}
                    checked={Array.isArray(selected) && selected.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (Array.isArray(selected)) {
                        setSelected(
                          checked 
                            ? [...selected, option.value]
                            : selected.filter(v => v !== option.value)
                        );
                      } else {
                        setSelected(checked ? [option.value] : []);
                      }
                    }}
                  />
                  <label htmlFor={`option-${option.value}`} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <Select value={selected as string} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={clear} className="flex-1">
          Clear
        </Button>
        <Button onClick={apply} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
}