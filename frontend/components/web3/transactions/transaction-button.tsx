'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import type { TransactionButtonProps } from '@/lib/types/web3/components'

export function TransactionButton({
  onClick,
  loading = false,
  loadingText = 'Processing...',
  disabled = false,
  children,
  variant = 'default',
  size = 'default',
  className
}: TransactionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn('relative', className)}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  )
}