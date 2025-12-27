'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  AlertCircle,
  Copy,
  Download,
  ChevronLeft,
  ChevronRight,
  Database,
  Check,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Support both old and new type systems
interface EntityDataTableProps {
  entityData: {
    data: Record<string, unknown>[]
    error?: string
    loading?: boolean
    entityName?: string
    metadata?: {
      entityName?: string
    }
  }
  loading: boolean
  onRefresh: () => void
}

export function EntityDataTable({ entityData, loading, onRefresh }: EntityDataTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(10)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const data = entityData.data || []
  const error = entityData.error
  const entityName = entityData.metadata?.entityName || entityData.entityName || 'Entity'

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  // Get all unique field names from the data
  const fieldNames = data.length > 0
    ? Array.from(new Set(data.flatMap(item => Object.keys(item))))
    : []

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '-'
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }

    const strValue = String(value)
    if (strValue.length > 50) {
      return strValue.substring(0, 50) + '...'
    }

    return strValue
  }

  const isAddress = (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value)
  }

  const isHash = (value: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(value)
  }

  const truncateHash = (hash: string, chars = 6): string => {
    if (hash.length <= chars * 2 + 2) return hash
    return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
  }

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text)
    if (id) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const exportToCSV = () => {
    if (data.length === 0) return

    const csvHeaders = fieldNames.join(',')
    const csvRows = data.map(item =>
      fieldNames.map(field => {
        const value = item[field]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return formatValue(value)
      }).join(',')
    )

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${entityName}_data.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${entityName}_data.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>{entityName} Data</span>
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              {error ? 'Error loading data' : `${data.length} records found`}
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
              Refresh
            </Button>

            {data.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToJSON}
                >
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2" />
            <p>No data found for this entity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Data Table */}
            <ScrollArea className="w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fieldNames.map((field) => (
                      <TableHead key={field} className="min-w-[120px]">
                        {field}
                      </TableHead>
                    ))}
                    <TableHead className="w-[50px]">Copy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item, rowIndex) => (
                    <TableRow key={item.id?.toString() || rowIndex}>
                      {fieldNames.map((field) => {
                        const value = item[field]
                        const stringValue = typeof value === 'string' ? value : formatValue(value)
                        const cellId = `${rowIndex}-${field}`

                        return (
                          <TableCell key={field} className="font-mono text-sm">
                            {typeof value === 'string' && (isAddress(value) || isHash(value)) ? (
                              <div className="flex items-center gap-1">
                                <span className="truncate max-w-[150px]" title={value}>
                                  {truncateHash(value)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(value, cellId)}
                                >
                                  {copiedId === cellId ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                                {isAddress(value) && (
                                  <a
                                    href={`https://etherscan.io/address/${value}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            ) : typeof value === 'boolean' ? (
                              <Badge variant={value ? 'default' : 'secondary'}>
                                {value ? 'true' : 'false'}
                              </Badge>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="truncate max-w-[200px]" title={stringValue}>
                                  {formatValue(value)}
                                </span>
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(JSON.stringify(item, null, 2))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i
                      } else if (currentPage < 3) {
                        pageNum = i
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum + 1}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Data Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.length}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{fieldNames.length}</div>
                <div className="text-sm text-muted-foreground">Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalPages}</div>
                <div className="text-sm text-muted-foreground">Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentPage + 1}</div>
                <div className="text-sm text-muted-foreground">Current Page</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
