import { ColumnDef } from '@tanstack/react-table'
import { Eye, PencilSimple, Pencil, Power } from '@phosphor-icons/react'
import { EmailTemplate } from '@/state/emailTemplatesSlice'

export const EMAIL_TPL_TABLE_ID = 'settings.emailTemplates.v1'

export const initialColumnSizing = {
  _select: 50,
  name: 250,
  subject: 350,
  language: 140,
  category: 140,
  updatedOn: 220,
  status: 140,
  actions: 280,
}

interface TableMeta {
  onInlineCommit: (id: string, patch: Partial<Pick<EmailTemplate, 'name' | 'subject'>>) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onOpenEdit: (template: EmailTemplate) => void
  onPreview: (template: EmailTemplate) => void
}

export const emailTemplateColumns: ColumnDef<EmailTemplate>[] = [
  // Selection column
  {
    id: '_select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    enableResizing: false,
    size: 50,
  },
  // Template Name
  {
    accessorKey: 'name',
    header: 'Template Name',
    cell: ({ getValue }) => {
      const value = getValue() as string
      return (
        <span className="text-sm font-medium text-gray-900">
          {value}
        </span>
      )
    },
    size: 250,
  },
  // Subject
  {
    accessorKey: 'subject',
    header: 'Subject',
    cell: ({ getValue }) => {
      const value = getValue() as string
      return (
        <span className="text-sm text-gray-700">
          {value}
        </span>
      )
    },
    size: 350,
  },
  // Language
  {
    accessorKey: 'language',
    header: 'Language',
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined
      return (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          {value || 'N/A'}
        </span>
      )
    },
    size: 140,
  },
  // Category
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined
      return (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          {value || 'General'}
        </span>
      )
    },
    size: 140,
  },
  // Updated On
  {
    accessorKey: 'updatedOn',
    header: 'Updated',
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined
      if (!value) return <span className="text-sm text-gray-500">-</span>
      
      try {
        const date = new Date(value)
        return (
          <span className="text-sm text-gray-600 tabular-nums">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      } catch {
        return <span className="text-sm text-gray-500">Invalid date</span>
      }
    },
    size: 220,
  },
  // Status
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row, table }) => {
      const template = row.original
      const meta = table.options.meta as TableMeta

      return (
        <button
          onClick={() => meta?.onToggleActive(template.id, template.isActive)}
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
            template.isActive
              ? 'bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-100'
              : 'bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-100'
          }`}
        >
          {template.isActive ? 'Active' : 'Disabled'}
        </button>
      )
    },
    size: 140,
  },
  // Actions
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const template = row.original
      const meta = table.options.meta as TableMeta

      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => meta?.onOpenEdit(template)}
            className="h-8 px-3 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            title="Edit template"
          >
            <Pencil size={12} />
            Edit
          </button>
          
          <button
            onClick={() => meta?.onPreview(template)}
            className="h-8 px-3 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            title="Preview template"
          >
            <Eye size={12} />
            Preview
          </button>
          
          <button
            onClick={() => meta?.onToggleActive(template.id, template.isActive)}
            className={`h-8 px-3 text-xs rounded border transition-colors flex items-center gap-1 font-medium ${
              template.isActive
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
            }`}
            title={template.isActive ? 'Disable template' : 'Enable template'}
          >
            <Power size={12} />
            {template.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      )
    },
    enableSorting: false,
    size: 280,
  },
]