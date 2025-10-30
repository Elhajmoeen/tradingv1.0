import * as React from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { Paper } from '@mui/material'
import { Button } from '@/components/ui/button'
import { useEntityStore, Entity } from '@/lib/store'
import { Eye } from '@phosphor-icons/react'

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'company', headerName: 'Company', width: 150 },
  { field: 'status', headerName: 'Status', width: 100 },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    cellClassName: 'actions',
    getActions: ({ id }) => {
      return [
        <GridActionsCellItem
          key="view"
          icon={<Eye size={16} />}
          label="View"
          className="textPrimary"
          onClick={() => {
            window.location.href = `/clients/${id}`
          }}
          color="inherit"
        />,
      ]
    },
  },
]

const paginationModel = { page: 0, pageSize: 10 }

export default function ClientsPage() {
    const { selectEntitiesByType, upsertMany } = useEntityStore()
    const clients = selectEntitiesByType('client')

    useEffect(() => {
        // Seed initial client data if none exists
        if (clients.length === 0) {
            const initialClients: Entity[] = [
                {
                    id: 'c1',
                    type: 'client',
                    firstName: 'John',
                    lastName: 'Doe',
                    status: 'New',
                    email: 'john.doe@example.com',
                    phone: '+1 (555) 123-4567',
                    company: 'Acme Corp',
                    password: 'johndoe123',
                    address: {
                        line1: '123 Main St',
                        city: 'Anytown',
                        state: 'CA',
                        zip: '12345'
                    },
                    notes: 'Initial contact made via website form.',
                    lastContact: '2024-01-15',
                    // Financial metrics
                    balance: 8500.25,
                    marginLevel: 110.2,
                    openPnl: -250.75,
                    totalPnl: 1500.50,
                    freeMargin: 6250.80,
                    margin: 2249.45,
                    equity: 8249.50,
                    openVolume: 1.75
                },
                {
                    id: 'c2',
                    type: 'client',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    status: 'Active',
                    password: 'janepass456',
                    email: 'jane.smith@example.com',
                    phone: '+1 (555) 987-6543',
                    company: 'Tech Solutions',
                    address: {
                        line1: '456 Oak Ave',
                        city: 'Somewhere',
                        state: 'NY',
                        zip: '67890'
                    },
                    notes: 'Regular client, very satisfied with our services.',
                    lastContact: '2024-01-20',
                    // Financial metrics
                    balance: 25750.90,
                    marginLevel: 150.8,
                    openPnl: 3250.15,
                    totalPnl: 8750.25,
                    freeMargin: 18500.65,
                    margin: 7250.25,
                    equity: 29001.05,
                    openVolume: 4.25
                },
                {
                    id: 'c3',
                    type: 'client',
                    firstName: 'Bob',
                    lastName: 'Johnson',
                    status: 'Inactive',
                    email: 'bob.johnson@example.com',
                    phone: '+1 (555) 456-7890',
                    company: 'Manufacturing Inc',
                    password: 'bobsecure789',
                    address: {
                        line1: '789 Pine St',
                        city: 'Elsewhere',
                        state: 'TX',
                        zip: '13579'
                    },
                    notes: 'Former client, left due to budget constraints.',
                    lastContact: '2023-12-15',
                    // Financial metrics
                    balance: 2150.40,
                    marginLevel: 95.2,
                    openPnl: -150.25,
                    totalPnl: -850.75,
                    freeMargin: 1500.15,
                    margin: 650.25,
                    equity: 2000.15,
                    openVolume: 0.85
                }
            ]
            upsertMany(initialClients)
        }
    }, [clients.length, upsertMany])

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="space-y-6">
                <div className="border-b pb-4">
                    <h1 className="text-2xl font-bold text-foreground">Clients</h1>
                    <p className="text-muted-foreground">Manage your client relationships</p>
                </div>

                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={clients}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10, 25]}
                        checkboxSelection
                        sx={{ border: 0 }}
                        getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                        }
                    />
                </Paper>
            </div>
        </div>
    )
}