import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
  ColumnDef,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TableSkinProps<T> {
  items: T[]
  columns: ColumnDef<T>[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onRowSelect?: (selectedIds: string[]) => void
  selectedIds?: string[]
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  emptyMessage?: string
}

export default function TableSkin<T>({
  items,
  columns,
  total,
  page,
  pageSize,
  onPageChange,
  onRowSelect,
  selectedIds = [],
  sorting = [],
  onSortingChange,
  rowSelection = {},
  onRowSelectionChange,
  emptyMessage = "No items found."
}: TableSkinProps<T>) {
  
  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  })

  // Sync manual pagination with external state
  React.useEffect(() => {
    if (table.getState().pagination.pageIndex !== page) {
      table.setPageIndex(page)
    }
  }, [page, table])

  // Handle page changes
  const handlePreviousPage = () => {
    const newPage = Math.max(0, page - 1)
    onPageChange(newPage)
  }

  const handleNextPage = () => {
    const maxPage = Math.ceil(total / pageSize) - 1
    const newPage = Math.min(maxPage, page + 1)
    onPageChange(newPage)
  }

  const canPreviousPage = page > 0
  const canNextPage = page < Math.ceil(total / pageSize) - 1

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                    style={{ width: header.getSize(), minWidth: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? ''}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                      style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar - Sticky at bottom */}
      <div className="sticky bottom-0 bg-background border-t flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {page * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {Math.min((page + 1) * pageSize, total)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">{total}</span>{' '}
            results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {Math.ceil(total / pageSize)}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}