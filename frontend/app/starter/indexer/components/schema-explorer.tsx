'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Hash,
  Type,
  Binary,
  Calendar,
  Database,
  Braces,
  List,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SchemaField {
  name: string
  type: string
  isRequired: boolean
  isArray: boolean
  isScalar: boolean
}

interface SchemaEntity {
  name: string
  pluralName: string
  fields: SchemaField[]
  isImmutable?: boolean
}

interface SchemaExplorerProps {
  schemaContent: string
  selectedFields: Map<string, Set<string>>
  onFieldToggle: (entity: string, field: string, add: boolean) => void
  onEntitySelect: (entity: SchemaEntity) => void
}

// Parse schema content into entities
function parseSchemaContent(schemaContent: string): SchemaEntity[] {
  const entities: SchemaEntity[] = []
  const cleanSchema = schemaContent.replace(/#[^\n]*/g, '')
  const typeRegex = /type\s+(\w+)\s*(@entity[^{]*)?\s*\{([^}]+)\}/g
  const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID', 'BigInt', 'BigDecimal', 'Bytes']
  let match

  while ((match = typeRegex.exec(cleanSchema)) !== null) {
    const [, typeName, directives = '', fieldsString] = match

    if (['Query', 'Mutation', 'Subscription', '_'].some(t => typeName.startsWith(t))) {
      continue
    }

    const fieldRegex = /(\w+)\s*:\s*(\[?\w+!?\]?!?)/g
    const fields: SchemaField[] = []
    let fieldMatch

    while ((fieldMatch = fieldRegex.exec(fieldsString)) !== null) {
      const [, name, typeStr] = fieldMatch
      const baseType = typeStr.replace(/[\[\]!]/g, '')
      fields.push({
        name,
        type: baseType,
        isRequired: typeStr.endsWith('!'),
        isArray: typeStr.startsWith('['),
        isScalar: scalarTypes.includes(baseType),
      })
    }

    const pluralName = typeName.endsWith('s') ? typeName :
      typeName.endsWith('y') ? typeName.slice(0, -1) + 'ies' :
        typeName + 's'

    entities.push({
      name: typeName,
      pluralName: pluralName.charAt(0).toLowerCase() + pluralName.slice(1),
      fields,
      isImmutable: directives.includes('immutable'),
    })
  }

  return entities
}

// Get icon for field type
function getTypeIcon(type: string, isArray: boolean) {
  if (isArray) return <List className="h-3 w-3" />

  switch (type) {
    case 'ID':
    case 'Bytes':
      return <Hash className="h-3 w-3" />
    case 'String':
      return <Type className="h-3 w-3" />
    case 'Int':
    case 'BigInt':
    case 'BigDecimal':
    case 'Float':
      return <Binary className="h-3 w-3" />
    case 'Boolean':
      return <Braces className="h-3 w-3" />
    default:
      return <Database className="h-3 w-3" />
  }
}

// Field row component
function FieldRow({
  entity,
  field,
  isSelected,
  onToggle,
}: {
  entity: string
  field: SchemaField
  isSelected: boolean
  onToggle: (add: boolean) => void
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors',
        isSelected
          ? 'bg-primary/10 border border-primary/30'
          : 'hover:bg-muted/50'
      )}
      onClick={() => onToggle(!isSelected)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn(
          'flex-shrink-0 text-muted-foreground',
          isSelected && 'text-primary'
        )}>
          {getTypeIcon(field.type, field.isArray)}
        </div>
        <span className={cn(
          'text-sm font-mono truncate',
          isSelected && 'text-primary font-medium'
        )}>
          {field.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] px-1 py-0',
            !field.isScalar && 'border-orange-500/50 text-orange-600'
          )}
        >
          {field.isArray ? `[${field.type}]` : field.type}
          {field.isRequired && '!'}
        </Badge>
        {isSelected ? (
          <Minus className="h-3 w-3 text-red-500" />
        ) : (
          <Plus className="h-3 w-3 text-green-500" />
        )}
      </div>
    </div>
  )
}

// Entity collapsible component
function EntitySection({
  entity,
  selectedFields,
  onFieldToggle,
  onSelectAll,
  onDeselectAll,
}: {
  entity: SchemaEntity
  selectedFields: Set<string>
  onFieldToggle: (field: string, add: boolean) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const scalarFields = entity.fields.filter(f => f.isScalar)
  const relationFields = entity.fields.filter(f => !f.isScalar)
  const selectedCount = selectedFields.size
  const selectableCount = scalarFields.length

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer group">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Database className="h-4 w-4 text-primary" />
            <span className="font-medium">{entity.name}</span>
            {entity.isImmutable && (
              <Badge variant="outline" className="text-[10px] px-1">
                immutable
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedCount}/{selectableCount}
            </Badge>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-6 pr-2 pb-2 space-y-1">
          {/* Quick actions */}
          <div className="flex gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onSelectAll()
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onDeselectAll()
              }}
            >
              <Minus className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>

          {/* Scalar fields */}
          {scalarFields.length > 0 && (
            <div className="space-y-0.5">
              {scalarFields.map((field) => (
                <FieldRow
                  key={field.name}
                  entity={entity.name}
                  field={field}
                  isSelected={selectedFields.has(field.name)}
                  onToggle={(add) => onFieldToggle(field.name, add)}
                />
              ))}
            </div>
          )}

          {/* Relation fields (shown differently) */}
          {relationFields.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">
                Relations (expand in query)
              </p>
              {relationFields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center gap-2 py-1 px-2 text-muted-foreground"
                >
                  {getTypeIcon(field.type, field.isArray)}
                  <span className="text-sm font-mono">{field.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1 border-orange-500/50 text-orange-600">
                    → {field.isArray ? `[${field.type}]` : field.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SchemaExplorer({
  schemaContent,
  selectedFields,
  onFieldToggle,
  onEntitySelect,
}: SchemaExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const entities = useMemo(() => {
    return parseSchemaContent(schemaContent)
  }, [schemaContent])

  const filteredEntities = useMemo(() => {
    if (!searchTerm) return entities
    const lower = searchTerm.toLowerCase()
    return entities.filter(e =>
      e.name.toLowerCase().includes(lower) ||
      e.fields.some(f => f.name.toLowerCase().includes(lower))
    )
  }, [entities, searchTerm])

  const handleSelectAll = useCallback((entity: SchemaEntity) => {
    entity.fields
      .filter(f => f.isScalar)
      .forEach(f => {
        if (!selectedFields.get(entity.name)?.has(f.name)) {
          onFieldToggle(entity.name, f.name, true)
        }
      })
  }, [selectedFields, onFieldToggle])

  const handleDeselectAll = useCallback((entity: SchemaEntity) => {
    entity.fields.forEach(f => {
      if (selectedFields.get(entity.name)?.has(f.name)) {
        onFieldToggle(entity.name, f.name, false)
      }
    })
  }, [selectedFields, onFieldToggle])

  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2" />
          <p>No schema available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Braces className="h-4 w-4" />
          Schema Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities & fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {/* Entity list */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {filteredEntities.map((entity) => (
              <EntitySection
                key={entity.name}
                entity={entity}
                selectedFields={selectedFields.get(entity.name) || new Set()}
                onFieldToggle={(field, add) => onFieldToggle(entity.name, field, add)}
                onSelectAll={() => handleSelectAll(entity)}
                onDeselectAll={() => handleDeselectAll(entity)}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        {selectedFields.size > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Selected: {Array.from(selectedFields.entries()).map(([entity, fields]) => (
                <span key={entity} className="ml-1">
                  <span className="font-medium text-foreground">{entity}</span>
                  ({fields.size})
                </span>
              ))}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
