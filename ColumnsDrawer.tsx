import { useState, useEffect } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  verticalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Checkbox,
  InputAdornment,
  FormControlLabel,
  Chip,
} from '@mui/material'
import {
  Search,
  ViewColumn,
  DragIndicator,
  Close,
  Visibility,
  VisibilityOff,
  RestartAlt,
} from '@mui/icons-material'

export interface ColumnDefinition {
  id: string
  header: string
  path: string
  type: string
  defaultVisible: boolean
  options?: { label: string; value: any }[]
  isCustomDocument?: boolean
}

interface ColumnsDrawerProps {
  columns: ColumnDefinition[]
  visibleColumns: Record<string, boolean>
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void
  onColumnOrderChange?: (newOrder: string[]) => void
  columnOrder?: string[]
  onSelectAll: () => void
  onClearAll: () => void
  onResetToDefault: () => void
  children: React.ReactNode
}

// Draggable Column Item Component
interface DraggableColumnItemProps {
  column: ColumnDefinition
  isVisible: boolean
  onVisibilityChange: (columnId: string, visible: boolean) => void
}

function DraggableColumnItem({ column, isVisible, onVisibilityChange }: DraggableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 1.5,
        mb: 0.5,
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        cursor: 'default',
        '&:hover': {
          backgroundColor: '#f9fafb',
          borderColor: '#d1d5db',
        },
        ...(isDragging && {
          backgroundColor: '#f0f9ff',
          borderColor: '#3b82f6',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }),
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
          p: 0.25,
          borderRadius: 1,
          '&:hover': { 
            backgroundColor: '#f3f4f6',
          },
          '&:active': { cursor: 'grabbing' },
        }}
        tabIndex={-1}
      >
        <DragIndicator sx={{ 
          fontSize: '0.9rem', 
          color: '#6b7280',
        }} />
      </Box>

      {/* Checkbox and Label */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isVisible}
            onChange={(e) => onVisibilityChange(column.id, e.target.checked)}
            size="small"
            sx={{ 
              color: '#6b7280',
              '&.Mui-checked': { 
                color: '#3b82f6',
              },
              p: 0.25,
            }}
          />
        }
        label={
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 400,
              color: '#374151',
              fontFamily: 'Poppins, sans-serif',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {column.header}
          </Typography>
        }
        sx={{ 
          flex: 1, 
          margin: 0,
          cursor: 'pointer'
        }}
        onClick={() => onVisibilityChange(column.id, !isVisible)}
      />

      {/* Visual Indicator Point on Right Edge */}
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: isVisible ? '#10b981' : '#e5e7eb',
          border: '2px solid #ffffff',
          boxShadow: isVisible ? '0 0 0 2px #10b981' : '0 0 0 1px #d1d5db',
          ml: 1,
          transition: 'all 0.2s ease-in-out',
          ...(isVisible && {
            animation: 'pulse 2s infinite',
          }),
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 },
          },
        }}
      />
    </Box>
  )
}

export function ColumnsDrawer({
  columns,
  visibleColumns,
  onColumnVisibilityChange,
  onColumnOrderChange,
  columnOrder: parentColumnOrder,
  onSelectAll,
  onClearAll,
  onResetToDefault,
  children,
}: ColumnsDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Initialize column order from parent prop or default order
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (parentColumnOrder) {
      return parentColumnOrder
    }
    return columns.map(col => col.id)
  })

  // Update column order when parent column order changes
  useEffect(() => {
    if (parentColumnOrder) {
      setColumnOrder(parentColumnOrder)
    }
  }, [parentColumnOrder])

  // Create ordered columns array
  const orderedColumns = columnOrder
    .map(id => columns.find(col => col.id === id))
    .filter(Boolean) as ColumnDefinition[]

  // Filter columns based on search query
  const filteredColumns = orderedColumns.filter(column =>
    column.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
    column.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const newOrder = arrayMove(
        columnOrder,
        columnOrder.indexOf(active.id as string),
        columnOrder.indexOf(over.id as string)
      )
      setColumnOrder(newOrder)
      onColumnOrderChange?.(newOrder)
    }
  }

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {})
  )

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length
  const totalCount = columns.length
  const hiddenCount = totalCount - visibleCount

  return (
    <>
      <Box onClick={() => setIsOpen(true)}>
        {children}
      </Box>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { 
              xs: '100%', 
              sm: '90%', 
              md: '400px', 
              lg: '450px', 
              xl: '500px' 
            },
            maxWidth: 'none',
            height: '100%',
          }
        }}
      >
        {/* Simple Compact Header */}
        <Box sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#374151',
              fontSize: '1.1rem',
            }}
          >
            Columns
          </Typography>
          
          <IconButton 
            onClick={() => setIsOpen(false)}
            size="small"
            sx={{ 
              color: '#6b7280',
              '&:hover': { 
                backgroundColor: '#f3f4f6',
                color: '#374151',
              }
            }}
          >
            <Close sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>

        {/* Compact Content Area */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ px: 3, py: 2, flexShrink: 0 }}>
            
            {/* Compact Search Section */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#6b7280', fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9fafb',
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused': {
                      borderColor: '#3b82f6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '8px 12px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            {/* Compact Quick Actions */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                fontWeight={500} 
                sx={{ 
                  mb: 1.5, 
                  color: '#374151', 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                }}
              >
                Quick Actions ({visibleCount}/{totalCount})
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap',
              }}>
                <Button
                  size="small"
                  onClick={onSelectAll}
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    height: '28px',
                    '&:hover': { 
                      backgroundColor: '#059669',
                    },
                  }}
                >
                  Show All
                </Button>
                <Button
                  size="small"
                  onClick={onClearAll}
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    height: '28px',
                    '&:hover': { 
                      backgroundColor: '#dc2626',
                    },
                  }}
                >
                  Hide All
                </Button>
                <Button
                  size="small"
                  onClick={onResetToDefault}
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    backgroundColor: '#6b7280',
                    color: '#ffffff',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    height: '28px',
                    '&:hover': { 
                      backgroundColor: '#4b5563',
                    },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>



          </Box>
          
          {/* Compact Column List with Drag & Drop */}
          <Box sx={{ px: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography 
              variant="body2" 
              fontWeight={500} 
              sx={{ 
                mb: 1.5, 
                color: '#374151', 
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
              }}
            >
              <DragIndicator sx={{ color: '#6b7280', fontSize: '1rem' }} />
              Drag to Reorder ({filteredColumns.length})
            </Typography>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={columnOrder.filter(id => 
                  filteredColumns.some(col => col.id === id)
                )}
                strategy={verticalListSortingStrategy}
              >
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  mr: -1,
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#cbd5e1',
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: '#94a3b8',
                    },
                  },
                }}>
                  {filteredColumns.map((column) => (
                    <DraggableColumnItem
                      key={column.id}
                      column={column}
                      isVisible={visibleColumns[column.id] || false}
                      onVisibilityChange={onColumnVisibilityChange}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>

            {filteredColumns.length === 0 && (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: 2,
                border: '1px dashed #d1d5db',
              }}>
                <ViewColumn sx={{ fontSize: '2.5rem', mb: 1.5, color: '#d1d5db' }} />
                <Typography variant="body2" sx={{ 
                  color: '#6b7280', 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                }}>
                  {searchQuery ? 'No columns match your search' : 'No columns available'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>


    </>
  )
}
