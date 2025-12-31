/**
 * Component Template
 *
 * Usage: Copy this template when creating a new component
 * Replace: __COMPONENT_NAME__
 */

'use client'

import { cn } from '@/lib/utils'

interface __COMPONENT_NAME__Props {
  className?: string
  children?: React.ReactNode
}

export function __COMPONENT_NAME__({ className, children }: __COMPONENT_NAME__Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}
