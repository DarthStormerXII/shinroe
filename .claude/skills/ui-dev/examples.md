# UI Development Examples

## Loading States

### Button with Loading

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await someAsyncAction()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  )
}
```

### Card Skeleton

```tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}
```

### Data Loading Pattern

```tsx
'use client'

import { CardSkeleton } from './card-skeleton'
import { ErrorAlert } from './error-alert'
import { DataCard } from './data-card'

interface Props {
  data: Data | null
  loading: boolean
  error: Error | null
  onRetry: () => void
}

export function DataDisplay({ data, loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={onRetry} />
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No data available
      </div>
    )
  }

  return <DataCard data={data} />
}
```

## Interactive Cards

### Hover Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  onClick: () => void
}

export function FeatureCard({ title, description, onClick }: FeatureCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 group"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
```

### Selection Card

```tsx
import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionCardProps {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}

export function SelectionCard({ title, description, selected, onSelect }: SelectionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {selected && (
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Responsive Layouts

### Two Column to Stack

```tsx
export function TwoColumnLayout({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="w-full lg:w-1/2">{left}</div>
      <div className="w-full lg:w-1/2">{right}</div>
    </div>
  )
}
```

### Grid with Responsive Columns

```tsx
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  )
}
```

### Sidebar Layout

```tsx
export function SidebarLayout({
  sidebar,
  content,
}: {
  sidebar: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar - hidden on mobile, fixed width on desktop */}
      <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-border">
        {sidebar}
      </aside>
      {/* Main content - fills remaining space */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {content}
      </main>
    </div>
  )
}
```

## Error Handling

### Error Alert with Details

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ErrorAlertProps {
  title?: string
  error: Error
  onRetry?: () => void
}

export function ErrorAlert({ title = "Error", error, onRetry }: ErrorAlertProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{getUserFriendlyMessage(error)}</p>

        <div className="mt-3 flex items-center gap-2">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
          >
            Details
            <ChevronDown className={cn(
              "ml-1 h-3 w-3 transition-transform",
              showDetails && "rotate-180"
            )} />
          </Button>
        </div>

        {showDetails && (
          <pre className="mt-3 p-3 bg-destructive/10 rounded text-xs overflow-auto max-h-32">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  )
}

function getUserFriendlyMessage(error: Error): string {
  if (error.message.includes('network')) return 'Network error. Check your connection.'
  if (error.message.includes('timeout')) return 'Request timed out. Please try again.'
  if (error.message.includes('401')) return 'Authentication required.'
  if (error.message.includes('403')) return 'You do not have permission.'
  if (error.message.includes('404')) return 'Resource not found.'
  return 'Something went wrong. Please try again.'
}
```

## Form Components

### Token Amount Input

```tsx
'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface TokenInputProps {
  value: string
  onChange: (value: string) => void
  balance?: string
  symbol: string
  label?: string
}

export function TokenInput({ value, onChange, balance, symbol, label = "Amount" }: TokenInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {balance && (
          <span className="text-sm text-muted-foreground">
            Balance: {balance} {symbol}
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          onChange={(e) => {
            const val = e.target.value
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
              onChange(val)
            }
          }}
          className="pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {balance && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onChange(balance)}
            >
              MAX
            </Button>
          )}
          <span className="text-sm font-medium">{symbol}</span>
        </div>
      </div>
    </div>
  )
}
```

### Search Input with Clear

```tsx
'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => onChange('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
```

## Status Indicators

### Step Progress

```tsx
import { Check, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

interface Step {
  id: string
  label: string
  status: StepStatus
}

interface StepProgressProps {
  steps: Step[]
}

export function StepProgress({ steps }: StepProgressProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            step.status === 'completed' && "bg-green-500/20 text-green-500",
            step.status === 'in_progress' && "bg-primary/20 text-primary",
            step.status === 'failed' && "bg-destructive/20 text-destructive",
            step.status === 'pending' && "bg-muted text-muted-foreground"
          )}>
            {step.status === 'completed' && <Check className="h-4 w-4" />}
            {step.status === 'in_progress' && <Loader2 className="h-4 w-4 animate-spin" />}
            {step.status === 'failed' && <X className="h-4 w-4" />}
            {step.status === 'pending' && <span className="text-sm">{index + 1}</span>}
          </div>
          <span className={cn(
            "text-sm",
            step.status === 'pending' && "text-muted-foreground"
          )}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### Badge Status

```tsx
import { Badge } from '@/components/ui/badge'

type Status = 'success' | 'pending' | 'failed' | 'warning'

interface StatusBadgeProps {
  status: Status
  label?: string
}

const statusConfig = {
  success: { className: 'bg-green-500/20 text-green-500 hover:bg-green-500/30', default: 'Success' },
  pending: { className: 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30', default: 'Pending' },
  failed: { className: 'bg-red-500/20 text-red-500 hover:bg-red-500/30', default: 'Failed' },
  warning: { className: 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30', default: 'Warning' },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge className={config.className}>
      {label || config.default}
    </Badge>
  )
}
```

## Tooltips and Popovers

### Info Tooltip

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Empty States

### No Data

```tsx
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```
