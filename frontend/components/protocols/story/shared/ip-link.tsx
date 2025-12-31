'use client'

import { ExternalLink } from 'lucide-react'
import { STORY_EXPLORER } from '@/constants/protocols/story'

interface IpLinkProps {
  ipId: string
  className?: string
  showIcon?: boolean
  truncate?: boolean
}

export function IpLink({
  ipId,
  className,
  showIcon = true,
  truncate = true,
}: IpLinkProps) {
  const displayId = truncate
    ? `${ipId.slice(0, 8)}...${ipId.slice(-6)}`
    : ipId

  return (
    <a
      href={`${STORY_EXPLORER}/ipa/${ipId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 hover:underline font-mono text-sm ${className || ''}`}
    >
      {displayId}
      {showIcon && <ExternalLink className="h-3 w-3" />}
    </a>
  )
}

export default IpLink
