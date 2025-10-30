import * as React from 'react'
import { useState, useEffect } from 'react'
import { profileTabs } from '@/config/fields'
import { FieldGrid } from '@/components/FieldGrid'
import { FinanceMetrics } from '@/components/FinanceMetrics'
import { TransactionHistory } from '@/components/TransactionHistory'
import { TransactionsAdapter } from '@/features/transactions_next/adapters/TransactionsAdapter'
import { isTransactionsNextEnabled } from '@/lib/flags'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

interface FinanceTabProps {
  clientId: string
}

export default function FinanceTab({ clientId }: FinanceTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  
  const tab = profileTabs.find(t => t.id === 'finance')
  
  // Initialize all sections as open by default
  useEffect(() => {
    if (tab) {
      const initialSections: Record<string, boolean> = {}
      tab.sections.forEach(section => {
        initialSections[section.title] = true
      })
      // Also initialize Transaction History section
      initialSections['Transaction History'] = true
      setOpenSections(initialSections)
    }
  }, [tab])

  if (!tab) {
    return <div className="text-muted-foreground">Finance tab configuration not found</div>
  }

  return (
    <div className="space-y-8">
      {/* Regular field sections - the new organized sections */}
      {tab.sections.map((section, index) => (
        <Collapsible 
          key={section.title} 
          open={openSections[section.title] ?? true}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, [section.title]: open }))}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full pb-3 hover:opacity-70 transition-opacity">
            <h2 className="text-lg font-semibold text-foreground relative">
              {section.title}
              <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
            </h2>
            {openSections[section.title] ?? true ? (
              <CaretUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <CaretDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-6">
            <FieldGrid entityId={clientId} fields={section.fields} />
          </CollapsibleContent>
          {index < tab.sections.length - 1 && (
            <div className="border-b border-gray-200 mt-2" />
          )}
        </Collapsible>
      ))}

      {/* Transaction History as last section */}
      <div className="border-b border-gray-200 mt-2" />
      <Collapsible 
        open={openSections['Transaction History'] ?? true}
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, 'Transaction History': open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full pb-3 hover:opacity-70 transition-opacity">
          <h2 className="text-lg font-semibold text-foreground relative">
            Transaction History
            <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
          </h2>
          {openSections['Transaction History'] ? (
            <CaretUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <CaretDown className="h-5 w-5 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-6">
          {isTransactionsNextEnabled() ? (
            <TransactionsAdapter clientId={clientId} />
          ) : (
            <TransactionHistory entityId={clientId} />
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}