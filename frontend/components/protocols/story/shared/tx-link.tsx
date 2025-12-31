'use client'

import { ExternalLink } from 'lucide-react'
import { STORY_EXPLORER } from '@/constants/protocols/story'

interface TxLinkProps {
  hash: string
  className?: string
  showIcon?: boolean
  truncate?: boolean
}

export function TxLink({
  hash,
  className,
  showIcon = true,
  truncate = true,
}: TxLinkProps) {
  const displayHash = truncate
    ? `${hash.slice(0, 10)}...${hash.slice(-8)}`
    : hash

  return (
    <a
      href={`${STORY_EXPLORER}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 hover:underline font-mono text-sm ${className || ''}`}
    >
      {displayHash}
      {showIcon && <ExternalLink className="h-3 w-3" />}
    </a>
  )
}

export default TxLink
