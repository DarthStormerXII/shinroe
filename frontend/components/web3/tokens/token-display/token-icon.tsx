'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getTokenLogoUrl, getTokenMetadata } from '@/lib/web3/assets'
import type { TokenIconProps } from '@/lib/types/web3/components'


export function TokenIcon({ 
  token, 
  size = 'md',
  fallback = true,
  className 
}: TokenIconProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoadAttempts, setImageLoadAttempts] = useState(0)

  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  }

  const sizeDimensions = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const generateGradient = (symbol: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-yellow-400 to-yellow-600',
      'from-green-400 to-green-600',
      'from-teal-400 to-teal-600',
      'from-cyan-400 to-cyan-600',
      'from-indigo-400 to-indigo-600',
    ]
    
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Get token metadata for local logo lookup
  const tokenMetadata = useMemo(() => {
    if ('address' in token && 'chainId' in token) {
      return getTokenMetadata(token.address, token.chainId)
    }
    return null
  }, [token])

  // Get the best available logo URL (local only)
  const logoURL = useMemo(() => {
    // If token has explicit logoURI, use it first
    if ('logoURI' in token && token.logoURI) {
      return token.logoURI
    }

    // Use local static images only
    if ('address' in token && 'chainId' in token) {
      return getTokenLogoUrl(
        token.address,
        token.chainId,
        tokenMetadata?.coingeckoId,
        'standard'
      )
    }

    return null
  }, [token, tokenMetadata])

  const symbol = token.symbol


  if (logoURL && !imageError) {
    return (
      <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
        <Image
          src={logoURL}
          alt={symbol}
          width={sizeDimensions[size]}
          height={sizeDimensions[size]}
          className="object-cover"
          onError={() => {
            if (imageLoadAttempts < 2) {
              // Try with a different size on first error
              setImageLoadAttempts(prev => prev + 1)
            } else {
              setImageError(true)
            }
          }}
        />
      </div>
    )
  }

  if (!fallback) {
    return (
      <div className={cn('rounded-full bg-gray-200', sizeClasses[size], className)} />
    )
  }

  const gradientClass = generateGradient(symbol)

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white bg-gradient-to-br',
        sizeClasses[size],
        textSizeClasses[size],
        gradientClass,
        className
      )}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  )
}