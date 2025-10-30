import * as React from 'react'
import { useState, useEffect } from 'react'
import { profileTabs } from '@/config/fields'
import { FieldGrid } from '@/components/FieldGrid'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

interface GeneralTabProps {
  clientId: string
}

export default function GeneralTab({ clientId }: GeneralTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  
  const tab = profileTabs.find(t => t.id === 'general')
  
  // Initialize all sections as open by default
  useEffect(() => {
    if (tab) {
      const initialSections: Record<string, boolean> = {}
      tab.sections.forEach(section => {
        initialSections[section.title] = true
      })
      setOpenSections(initialSections)
    }
  }, [tab])

  if (!tab) {
    return <div className="text-muted-foreground">General tab configuration not found</div>
  }

  return (
    <div className="space-y-8">
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
            <FieldGrid key={`${clientId}-${section.title}`} entityId={clientId} fields={section.fields} />
          </CollapsibleContent>
          {index < tab.sections.length - 1 && (
            <div className="border-b border-gray-200 mt-2" />
          )}
        </Collapsible>
      ))}
    </div>
  )
}