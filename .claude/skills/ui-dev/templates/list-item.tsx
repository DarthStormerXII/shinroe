/**
 * List Item Template
 *
 * Usage: Copy this template when creating list item components
 * Replace: __ITEM_NAME__, ItemData interface
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ItemData {
  id: string
  title: string
  description: string
  status: 'active' | 'pending' | 'completed'
  timestamp: string
}

interface __ITEM_NAME__Props {
  item: ItemData
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusColors = {
  active: 'bg-green-500/20 text-green-500',
  pending: 'bg-yellow-500/20 text-yellow-500',
  completed: 'bg-blue-500/20 text-blue-500',
}

export function __ITEM_NAME__({ item, onView, onEdit, onDelete }: __ITEM_NAME__Props) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{item.title}</h3>
              <Badge className={statusColors[item.status]}>{item.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            <p className="text-xs text-muted-foreground mt-2">{item.timestamp}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(item.id)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
