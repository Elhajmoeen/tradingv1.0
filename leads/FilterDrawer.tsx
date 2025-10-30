import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ArrowRight, DotsSixVertical, Star } from '@phosphor-icons/react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConditionRow } from './ConditionRow';
import { 
  FilterState, 
  ColumnDef, 
  Condition, 
  generateId
} from './filters';
import { createColumnView } from '../../features/tableViews/columnViewsSlice';

// Sortable Column Item Component for Active Columns Table
interface SortableColumnItemProps {
  column: ColumnDef;
  onRemove: (columnId: string) => void;
}

function SortableColumnItem({ column, onRemove }: SortableColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        backgroundColor: isDragging ? '#f3f4f6' : '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 1,
        cursor: isDragging ? 'grabbing' : 'default',
        '&:hover': { 
          backgroundColor: '#f9fafb'
        }
      }}
    >
      {/* Drag Handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          color: '#6b7280',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        <DotsSixVertical size={12} />
      </Box>

      {/* Column Name */}
      <Typography variant="body2" sx={{ 
        fontWeight: 500, 
        flex: 1,
        fontSize: '0.875rem'
      }}>
        {column.label}
      </Typography>

      {/* Remove Button */}
      <Box
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(column.id);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          color: '#dc2626',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#fecaca'
          }
        }}
      >
        <X size={12} />
      </Box>
    </Box>
  );
}

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnDef[];
  filterState: FilterState;
  onApply: (filterState: FilterState) => void;
  tableId?: string;
  visibleColumns?: Record<string, boolean>;
  columnOrder?: string[];
  onViewSaved?: () => void; // Callback to refresh views list
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onOpenChange,
  columns,
  filterState,
  onApply,
  tableId,
  visibleColumns,
  columnOrder,
  onViewSaved
}) => {
  const [localFilterState, setLocalFilterState] = useState<FilterState>({ conditions: [] });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Two-table state
  const [availableColumns, setAvailableColumns] = useState<ColumnDef[]>([]);
  const [activeColumns, setActiveColumns] = useState<ColumnDef[]>([]);
  
  // Originals for Cancel
  const [originalAvailableColumns, setOriginalAvailableColumns] = useState<ColumnDef[]>([]);
  const [originalActiveColumns, setOriginalActiveColumns] = useState<ColumnDef[]>([]);

  // Lock to prevent re-initialization while dialog is open
  const dialogInitRef = useRef(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Keep only filter conditions in sync on drawer open
  useEffect(() => {
    if (open) setLocalFilterState({ ...filterState });
  }, [open, filterState]);

  // Initialize column selector ONCE per dialog open (snapshot props at open time)
  useEffect(() => {
    if (!saveDialogOpen) {
      dialogInitRef.current = false; // reset for next open
      return;
    }
    if (dialogInitRef.current) return; // already initialized for this open
    dialogInitRef.current = true;

    if (visibleColumns && columns.length > 0) {
      const act = columns.filter(c => visibleColumns[c.id]);
      const avail = columns.filter(c => !visibleColumns[c.id]);
      setActiveColumns(act);
      setAvailableColumns(avail);
      setOriginalActiveColumns([...act]);
      setOriginalAvailableColumns([...avail]);
    } else {
      setActiveColumns([]);
      setAvailableColumns(columns);
      setOriginalActiveColumns([]);
      setOriginalAvailableColumns([...columns]);
    }
    // IMPORTANT: no columns/visibleColumns in deps – snapshot happens at open time only
  }, [saveDialogOpen]);

  const handleAddCondition = () => {
    if (columns.length === 0) return;
    const firstColumn = columns[0];
    const newCondition: Condition = {
      id: generateId(),
      fieldId: firstColumn.id,
      columnId: firstColumn.id,
      operator: firstColumn.operators?.[0] || 'contains',
      value: '',
      label: firstColumn.label
    };
    setLocalFilterState(prev => ({ conditions: [...prev.conditions, newCondition] }));
  };

  const handleConditionChange = (conditionId: string, updates: Partial<Condition>) => {
    setLocalFilterState(prev => ({
      conditions: prev.conditions.map(c => (c.id === conditionId ? { ...c, ...updates } : c))
    }));
  };

  const handleConditionRemove = (conditionId: string) => {
    setLocalFilterState(prev => ({
      conditions: prev.conditions.filter(c => c.id !== conditionId)
    }));
  };

  const handleApply = () => {
    onApply(localFilterState);
    onOpenChange(false);
  };

  const handleClear = () => setLocalFilterState({ conditions: [] });

  const handleSaveView = () => {
    if (!tableId) return;
    setSaveDialogOpen(true);
    setViewName('');
    setIsFavorite(false);
    // init handled by effect tied to saveDialogOpen with lock
  };

  const handleSaveViewConfirm = () => {
    if (!viewName.trim() || !tableId) {
      console.log('Save view validation failed:', { viewName: viewName.trim(), tableId });
      return;
    }
    
    const selectedColumnIds = activeColumns.map(col => col.id);
    const currentColumnOrder = selectedColumnIds.slice();

    console.log('Saving view:', {
      tableId,
      name: viewName.trim(),
      selectedColumnIds,
      columnOrder: currentColumnOrder
    });

    try {
      const newView = createColumnView({
        tableId,
        name: viewName.trim(),
        selectedColumnIds,
        columnOrder: currentColumnOrder,
        isFavorite
      });

      console.log('View saved successfully:', newView);
      
      setSaveDialogOpen(false);
      setViewName('');
      setIsFavorite(false);
      setOriginalAvailableColumns([]);
      setOriginalActiveColumns([]);
      onViewSaved?.();
    } catch (error) {
      console.error('Error saving view:', error);
    }
  };

  const handleSaveViewCancel = () => {
    setSaveDialogOpen(false);
    setViewName('');
    setIsFavorite(false);
    // restore snapshot (if you want to keep in-dialog changes on cancel, remove these two lines)
    setAvailableColumns([...originalAvailableColumns]);
    setActiveColumns([...originalActiveColumns]);
  };

  const handleAddColumn = (columnId: string) => {
    setActiveColumns(prev => {
      const toAdd = availableColumns.find(c => c.id === columnId);
      if (!toAdd || prev.some(c => c.id === columnId)) return prev;
      return [...prev, toAdd];
    });
    setAvailableColumns(prev => prev.filter(c => c.id !== columnId));
  };

  const handleRemoveColumn = (columnId: string) => {
    setAvailableColumns(prev => {
      const toReturn = activeColumns.find(c => c.id === columnId);
      if (!toReturn || prev.some(c => c.id === columnId)) return prev;
      return [...prev, toReturn];
    });
    setActiveColumns(prev => prev.filter(c => c.id !== columnId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setActiveColumns(items => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => onOpenChange(false)}
        PaperProps={{
          sx: { 
            width: { xs: '100%', md: '50%' },
            maxWidth: 'none',
            backgroundColor: '#ffffff',
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: '#111827' }}>
                  Filter Leads
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Configure filter conditions for leads data
                  </Typography>
                  <Chip 
                    label={`${localFilterState.conditions.length} condition${localFilterState.conditions.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: '#d1d5db',
                      color: '#374151',
                      backgroundColor: localFilterState.conditions.length > 0 ? '#f3f4f6' : 'transparent',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>
              <IconButton 
                onClick={() => onOpenChange(false)}
                sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f3f4f6', color: '#374151' } }}
              >
                <X size={18} />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, px: 4, py: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleAddCondition}
                disabled={columns.length === 0}
                sx={{
                  height: '48px',
                  px: 4,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 300,
                  backgroundColor: '#2563eb',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  '&:disabled': { backgroundColor: '#e5e7eb', color: '#9ca3af' }
                }}
              >
                Add Condition
              </Button>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {localFilterState.conditions.length === 0 && (
                  <Box sx={{ p: 6, textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <Typography variant="body1" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                      No filter conditions configured
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      Use the "Add Condition" button to create filter criteria
                    </Typography>
                  </Box>
                )}

                {localFilterState.conditions.map(condition => (
                  <ConditionRow
                    key={condition.id}
                    condition={condition}
                    columns={columns}
                    onChange={(updates) => handleConditionChange(condition.id, updates)}
                    onRemove={() => handleConditionRemove(condition.id)}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box className="flex flex-row justify-end gap-4 px-6 py-6 bg-white border-t border-gray-200">
            {tableId && (
              <Button 
                onClick={handleSaveView}
                variant="contained" 
                sx={{
                  height: '48px',
                  px: 3,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 300,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#047857' }
                }}
              >
                Save View
              </Button>
            )}
            <Button 
              variant="contained" 
              onClick={handleClear}
              sx={{
                height: '48px',
                px: 3,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 300,
                backgroundColor: '#dc2626',
                color: '#ffffff',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#b91c1c' }
              }}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              onClick={handleApply}
              sx={{
                height: '48px',
                px: 4,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 300,
                backgroundColor: '#2563eb',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Save View Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={handleSaveViewCancel} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#ffffff',
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          py: 2,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              fontFamily: 'Poppins, sans-serif',
              color: '#111827' 
            }}>
              Save Column View
            </Typography>
            <IconButton 
              onClick={handleSaveViewCancel}
              sx={{ 
                color: '#6b7280', 
                '&:hover': { 
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                } 
              }}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            py: 4
          }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <Typography variant="body2" fontWeight={600} sx={{ 
                mb: 1, 
                color: '#374151', 
                fontFamily: 'Poppins, sans-serif' 
              }}>
                View Name *
              </Typography>
              <TextField
                autoFocus
                fullWidth
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Enter a descriptive name for this view"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9fafb',
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9ca3af',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#263238',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '12px 16px',
                    fontFamily: 'Poppins, sans-serif',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />
              
              {/* Favorite Checkbox */}
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      icon={<Star size={20} />}
                      checkedIcon={<Star size={20} weight="fill" />}
                      sx={{
                        color: '#fbbf24',
                        '&.Mui-checked': {
                          color: '#f59e0b',
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: 20,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Set as favorite view (auto-load when visiting leads page)
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              </Box>
            </Box>
          </Box>

          <Typography variant="subtitle1" sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: '#374151',
            fontFamily: 'Poppins, sans-serif' 
          }}>
            Column Selector
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, height: '300px' }}>
            {/* Available Columns */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Available Columns ({availableColumns.length})
              </Typography>
              <Paper sx={{ 
                height: '100%', 
                border: '1px solid #e5e7eb', 
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 1, 
                  height: '100%', 
                  overflowY: 'auto' 
                }}>
                  {availableColumns.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        All columns selected
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {availableColumns.map((column) => (
                        <Box 
                          key={column.id}
                          onClick={() => handleAddColumn(column.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: '#f9fafb',
                              borderColor: '#059669'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}>
                            {column.label}
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            backgroundColor: '#059669',
                            borderRadius: '50%',
                            color: 'white'
                          }}>
                            <Plus size={12} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* Selected Columns */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Selected Columns ({activeColumns.length})
              </Typography>
              <Paper sx={{ 
                height: '100%', 
                border: '1px solid #e5e7eb',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 1, 
                  height: '100%', 
                  overflowY: 'auto' 
                }}>
                  {activeColumns.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No columns selected
                      </Typography>
                    </Box>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={activeColumns.map(col => col.id)} strategy={verticalListSortingStrategy}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {activeColumns.map((column) => (
                            <SortableColumnItem key={column.id} column={column} onRemove={handleRemoveColumn} />
                          ))}
                        </Box>
                      </SortableContext>
                    </DndContext>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            mt: 3, 
            pt: 3,
            borderTop: '1px solid #e5e7eb',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="body2" sx={{ 
              color: '#6b7280'
            }}>
              {activeColumns.length} of {columns.length} columns selected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button 
                size="small" 
                onClick={() => { setActiveColumns([...columns]); setAvailableColumns([]); }}
                sx={{
                  px: 2.5,
                  py: 0.75,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#e0f2fe',
                    borderColor: '#7dd3fc'
                  }
                }}
              >
                Select All
              </Button>
              <Button 
                size="small" 
                onClick={() => { setAvailableColumns([...columns]); setActiveColumns([]); }}
                sx={{
                  px: 2.5,
                  py: 0.75,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#fee2e2',
                    borderColor: '#fca5a5'
                  }
                }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleSaveViewCancel}
            sx={{
              px: 3,
              py: 1.5,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveViewConfirm} 
            disabled={!viewName.trim() || activeColumns.length === 0} 
            variant="contained"
            sx={{
              px: 3,
              py: 1.5,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              backgroundColor: '#2563eb',
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1d4ed8'
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af'
              }
            }}
          >
            Save View
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
