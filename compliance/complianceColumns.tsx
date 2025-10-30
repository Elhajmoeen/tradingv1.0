import { ColumnDef } from '@tanstack/react-table'
import { ComplianceRow } from '@/state/complianceSlice'
import { ColumnDefinition } from '@/components/ColumnsDrawer'

// Date cell renderer
const DateCell = ({ value }: { value?: string }) => (
  <span className="tabular-nums text-gray-700">
    {value ? new Date(value).toLocaleString() : '—'}
  </span>
)

// Number cell renderer
const NumberCell = ({ value }: { value?: number }) => (
  <span className="tabular-nums text-gray-700">
    {value !== undefined && value !== null ? value.toLocaleString() : '—'}
  </span>
)

// Badge component
const Badge = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
      ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}
  >
    {label}
  </span>
)

// KYC Status badge
const KycStatusBadge = ({ status }: { status?: string }) => {
  const getColor = (s?: string) => {
    switch (s) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Expired':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs border ${getColor(status)}`}>
      {status || '—'}
    </span>
  )
}

// Document cell - shows upload status
const DocCell = ({ fileId }: { fileId?: string }) => {
  const ok = Boolean(fileId)
  
  const handleClick = () => {
    if (ok && fileId) {
      // TODO: Open document viewer/drawer
      console.log('Open document:', fileId)
    }
  }

  return (
    <button
      disabled={!ok}
      onClick={handleClick}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${
        ok
          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
          : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
      }`}
      title={ok ? 'Open document' : 'No document'}
    >
      {ok ? 'Uploaded' : '—'}
      {ok && (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </button>
  )
}

// Compliance columns definition
export const complianceColumns: ColumnDef<ComplianceRow>[] = [
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: 'Account ID',
    cell: ({ getValue }) => <span className="font-mono text-sm">{getValue() as string || '—'}</span>,
    size: 160,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 180,
  },
  {
    id: 'desk',
    accessorKey: 'desk',
    header: 'Desk',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 120,
  },
  {
    id: 'salesManager',
    accessorKey: 'salesManager',
    header: 'Sales Manager',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 180,
  },
  {
    id: 'conversationOwner',
    accessorKey: 'conversationOwner',
    header: 'Conversation Owner',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 180,
  },
  {
    id: 'retentionOwner',
    accessorKey: 'retentionOwner',
    header: 'Retention Owner',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 180,
  },
  {
    id: 'retentionManager',
    accessorKey: 'retentionManager',
    header: 'Retention Manager',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 180,
  },
  {
    id: 'accountType',
    accessorKey: 'accountType',
    header: 'Account Type',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'regulation',
    accessorKey: 'regulation',
    header: 'Regulation',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 120,
  },
  {
    id: 'firstName',
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({ getValue }) => <span className="text-sm font-medium">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'lastName',
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ getValue }) => <span className="text-sm font-medium">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => {
      const email = getValue() as string
      return email ? (
        <a href={`mailto:${email}`} className="text-sm text-blue-600 hover:underline">
          {email}
        </a>
      ) : (
        <span className="text-sm text-gray-500">—</span>
      )
    },
    size: 220,
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ getValue }) => {
      const phone = getValue() as string
      return phone ? (
        <a href={`tel:${phone}`} className="text-sm text-blue-600 hover:underline">
          {phone}
        </a>
      ) : (
        <span className="text-sm text-gray-500">—</span>
      )
    },
    size: 160,
  },
  {
    id: 'phone2',
    accessorKey: 'phone2',
    header: 'Phone 2',
    cell: ({ getValue }) => {
      const phone = getValue() as string
      return phone ? (
        <a href={`tel:${phone}`} className="text-sm text-blue-600 hover:underline">
          {phone}
        </a>
      ) : (
        <span className="text-sm text-gray-500">—</span>
      )
    },
    size: 160,
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: 'Country',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'dateOfBirth',
    accessorKey: 'dateOfBirth',
    header: 'Date of Birth',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 160,
  },
  {
    id: 'age',
    accessorKey: 'age',
    header: 'Age',
    cell: ({ getValue }) => <NumberCell value={getValue() as number} />,
    size: 90,
  },
  {
    id: 'gender',
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 110,
  },
  {
    id: 'citizen',
    accessorKey: 'citizen',
    header: 'Citizen',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'language',
    accessorKey: 'language',
    header: 'Language',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'firstTradedAt',
    accessorKey: 'firstTradedAt',
    header: 'First Traded At',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 180,
  },
  {
    id: 'lastTradedAt',
    accessorKey: 'lastTradedAt',
    header: 'Last Traded At',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 180,
  },
  {
    id: 'followUpAt',
    accessorKey: 'followUpAt',
    header: 'Follow Up At',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 180,
  },
  {
    id: 'dateConverted',
    accessorKey: 'dateConverted',
    header: 'Date Converted',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 180,
  },
  {
    id: 'kycStatus',
    accessorKey: 'kycStatus',
    header: 'KYC Status',
    cell: ({ getValue }) => <KycStatusBadge status={getValue() as string} />,
    size: 120,
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: 'Address',
    cell: ({ getValue }) => (
      <span className="text-sm truncate block max-w-[200px]" title={getValue() as string}>
        {getValue() as string || '—'}
      </span>
    ),
    size: 220,
  },
  {
    id: 'address1',
    accessorKey: 'address1',
    header: 'Address 1',
    cell: ({ getValue }) => (
      <span className="text-sm truncate block max-w-[200px]" title={getValue() as string}>
        {getValue() as string || '—'}
      </span>
    ),
    size: 220,
  },
  {
    id: 'zip',
    accessorKey: 'zip',
    header: 'ZIP',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 110,
  },
  {
    id: 'city',
    accessorKey: 'city',
    header: 'City',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'state',
    accessorKey: 'state',
    header: 'State',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 120,
  },
  {
    id: 'nationality',
    accessorKey: 'nationality',
    header: 'Nationality',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'dod',
    accessorKey: 'dod',
    header: 'DOD',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 140,
  },
  // Document reference columns
  {
    id: 'idPassport',
    accessorKey: 'idPassport',
    header: 'ID/Passport #',
    cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() as string || '—'}</span>,
    size: 140,
  },
  {
    id: 'proofOfAddress',
    accessorKey: 'proofOfAddress',
    header: 'Proof of Address #',
    cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() as string || '—'}</span>,
    size: 160,
  },
  {
    id: 'creditCardFront',
    accessorKey: 'creditCardFront',
    header: 'CC Front #',
    cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() as string || '—'}</span>,
    size: 160,
  },
  {
    id: 'creditCardBack',
    accessorKey: 'creditCardBack',
    header: 'CC Back #',
    cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() as string || '—'}</span>,
    size: 160,
  },
  // Document upload columns (with viewer links)
  {
    id: 'idPassportUpload',
    accessorKey: 'idPassportUpload',
    header: 'ID/Passport Upload',
    cell: ({ getValue }) => <DocCell fileId={getValue() as string} />,
    size: 180,
  },
  {
    id: 'proofOfAddressUpload',
    accessorKey: 'proofOfAddressUpload',
    header: 'POA Upload',
    cell: ({ getValue }) => <DocCell fileId={getValue() as string} />,
    size: 200,
  },
  {
    id: 'creditCardFrontUpload',
    accessorKey: 'creditCardFrontUpload',
    header: 'CC Front Upload',
    cell: ({ getValue }) => <DocCell fileId={getValue() as string} />,
    size: 200,
  },
  {
    id: 'creditCardBackUpload',
    accessorKey: 'creditCardBackUpload',
    header: 'CC Back Upload',
    cell: ({ getValue }) => <DocCell fileId={getValue() as string} />,
    size: 200,
  },
  // Financial columns
  {
    id: 'totalFtd',
    accessorKey: 'totalFtd',
    header: 'Total FTD',
    cell: ({ getValue }) => <NumberCell value={getValue() as number} />,
    size: 120,
  },
  {
    id: 'ftdDate',
    accessorKey: 'ftdDate',
    header: 'FTD Date',
    cell: ({ getValue }) => <DateCell value={getValue() as string} />,
    size: 160,
  },
  {
    id: 'ftd',
    accessorKey: 'ftd',
    header: 'FTD Amount',
    cell: ({ getValue }) => <NumberCell value={getValue() as number} />,
    size: 120,
  },
  {
    id: 'paymentGateway',
    accessorKey: 'paymentGateway',
    header: 'Payment Gateway',
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string || '—'}</span>,
    size: 160,
  },
]

// Convert TanStack columns to EntityTable ColumnDefinition format
export const getComplianceColumnDefinitions = (): ColumnDefinition[] => {
  return complianceColumns.map(col => ({
    id: col.id as string,
    header: typeof col.header === 'string' ? col.header : col.id as string,
    path: col.accessorKey as string,
    type: getColumnType(col.id as string),
    defaultVisible: getDefaultVisibility(col.id as string)
  }))
}

// Helper to determine column type
function getColumnType(columnId: string): 'text' | 'number' | 'date' | 'boolean' | 'select' | 'status' | 'datetime' {
  if (columnId.includes('Date') || columnId.includes('At')) return 'datetime'
  if (columnId === 'age' || columnId.includes('ftd') || columnId.includes('Ftd') || columnId.includes('Amount')) return 'number'
  if (columnId === 'kycStatus') return 'status'
  return 'text'
}

// Helper to determine default visibility
function getDefaultVisibility(columnId: string): boolean {
  const defaultVisible = [
    'accountId', 'createdAt', 'firstName', 'lastName', 'email', 'phone',
    'kycStatus', 'desk', 'salesManager', 'country',
    'idPassportUpload', 'proofOfAddressUpload', 'creditCardFrontUpload', 'creditCardBackUpload'
  ]
  return defaultVisible.includes(columnId)
}
