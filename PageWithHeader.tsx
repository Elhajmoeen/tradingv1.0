import { ReactNode } from 'react'

interface PageWithHeaderProps {
  header: ReactNode
  children: ReactNode
}

/**
 * Shared layout pattern for CRM pages with a full-width header and content below
 */
export function PageWithHeader({ header, children }: PageWithHeaderProps) {
  return (
    <div className="m-0 p-0">
      <div className="w-full px-0 py-0">
        {header}
      </div>
      {children}
    </div>
  )
}