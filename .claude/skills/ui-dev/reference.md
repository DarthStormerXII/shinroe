# UI Development Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Button | `<Button>` from shadcn | `<button>` | Built-in variants, accessible |
| Modal/popup | `<Dialog>` from shadcn | Custom modal | Handles focus trap, animations |
| Form input | `<Input>` + `<Label>` | `<input>` | Consistent styling, accessible |
| Dropdown | `<Select>` or `<DropdownMenu>` | `<select>` | Better styling, keyboard nav |
| Loading state | `<Skeleton>` | Spinner only | Shows content shape |
| Notification | `useToast()` + `<Toaster>` | Alert/custom | Handles timing, stacking |
| Color | Theme variable (`bg-primary`) | Hardcoded (`bg-blue-500`) | Supports theming |
| Spacing | Tailwind scale (`p-4`) | Pixels (`p-[16px]`) | Consistent scale |
| Animation | `animate-*` classes | Inline keyframes | Predefined, consistent |
| Responsive | Mobile-first (`md:`) | Desktop-first | Better UX pattern |

---

## shadcn/ui Components

### Available Components

| Component | Install | Import |
|-----------|---------|--------|
| Alert | `npx shadcn@latest add alert` | `import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'` |
| Badge | `npx shadcn@latest add badge` | `import { Badge } from '@/components/ui/badge'` |
| Button | `npx shadcn@latest add button` | `import { Button } from '@/components/ui/button'` |
| Card | `npx shadcn@latest add card` | `import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'` |
| Dialog | `npx shadcn@latest add dialog` | `import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'` |
| Dropdown Menu | `npx shadcn@latest add dropdown-menu` | `import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'` |
| Input | `npx shadcn@latest add input` | `import { Input } from '@/components/ui/input'` |
| Label | `npx shadcn@latest add label` | `import { Label } from '@/components/ui/label'` |
| Select | `npx shadcn@latest add select` | `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'` |
| Skeleton | `npx shadcn@latest add skeleton` | `import { Skeleton } from '@/components/ui/skeleton'` |
| Table | `npx shadcn@latest add table` | `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'` |
| Tabs | `npx shadcn@latest add tabs` | `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'` |
| Toast | `npx shadcn@latest add toast` | `import { useToast } from '@/hooks/use-toast'` |
| Tooltip | `npx shadcn@latest add tooltip` | `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'` |

### Button Variants

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card Composition

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog Pattern

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Theme Colors (CSS Variables)

### globals.css Definition

```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --radius: 0.5rem;
}
```

### Adding Custom Colors

1. **Add CSS variable in globals.css:**
```css
.dark {
  --brand: 262 83% 58%;      /* Purple */
  --success: 142 76% 36%;    /* Green */
  --warning: 38 92% 50%;     /* Orange */
}
```

2. **Extend tailwind.config.ts:**
```ts
theme: {
  extend: {
    colors: {
      brand: "hsl(var(--brand))",
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
    }
  }
}
```

3. **Use in components:**
```tsx
<div className="bg-brand text-white">Branded element</div>
<Badge className="bg-success">Success</Badge>
```

## Animation Keyframes

### tailwind.config.ts Definition

```ts
keyframes: {
  "fade-in": {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" }
  },
  "fade-out": {
    "0%": { opacity: "1" },
    "100%": { opacity: "0" }
  },
  "slide-in-bottom": {
    "0%": { transform: "translateY(20px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" }
  },
  "slide-in-right": {
    "0%": { transform: "translateX(20px)", opacity: "0" },
    "100%": { transform: "translateX(0)", opacity: "1" }
  },
  "scale-in": {
    "0%": { transform: "scale(0.95)", opacity: "0" },
    "100%": { transform: "scale(1)", opacity: "1" }
  },
  "bounce-in": {
    "0%": { transform: "scale(0.3)" },
    "50%": { transform: "scale(1.05)" },
    "70%": { transform: "scale(0.9)" },
    "100%": { transform: "scale(1)" }
  },
  "shimmer": {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" }
  },
  "float": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-10px)" }
  },
  "pulse-subtle": {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.7" }
  }
},
animation: {
  "fade-in": "fade-in 0.3s ease-out",
  "fade-out": "fade-out 0.3s ease-out",
  "slide-in-bottom": "slide-in-bottom 0.4s ease-out",
  "slide-in-right": "slide-in-right 0.4s ease-out",
  "scale-in": "scale-in 0.2s ease-out",
  "bounce-in": "bounce-in 0.5s ease-out",
  "shimmer": "shimmer 2s infinite linear",
  "float": "float 3s ease-in-out infinite",
  "pulse-subtle": "pulse-subtle 2s ease-in-out infinite"
}
```

## Lucide React Icons

### Common Icons

```tsx
import {
  // Navigation
  Menu, X, ChevronDown, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft,
  // Actions
  Plus, Minus, Check, Copy, Edit, Trash2, Download, Upload, Search,
  // Status
  Loader2, AlertCircle, CheckCircle, XCircle, Info,
  // Web3
  Wallet, Link, ExternalLink, QrCode,
  // UI
  Settings, User, LogOut, Sun, Moon, Eye, EyeOff,
} from 'lucide-react'
```

### Icon Sizing Convention

| Size | Class | Usage |
|------|-------|-------|
| Extra Small | `h-3 w-3` | Inline with small text |
| Small | `h-4 w-4` | Buttons, badges |
| Medium | `h-5 w-5` | Default, standalone |
| Large | `h-6 w-6` | Headers, emphasis |
| Extra Large | `h-8 w-8` | Hero sections |

### Icon Button Pattern

```tsx
<Button size="icon" variant="ghost">
  <Settings className="h-4 w-4" />
</Button>
```

## Tailwind Utilities

### Spacing Scale

| Class | Value | Pixels |
|-------|-------|--------|
| `p-0` | 0 | 0px |
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-3` | 0.75rem | 12px |
| `p-4` | 1rem | 16px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |
| `p-12` | 3rem | 48px |

### Common Patterns

```tsx
// Flexbox layouts
"flex items-center justify-between"
"flex flex-col gap-4"
"flex flex-wrap gap-2"

// Grid layouts
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
"grid grid-cols-[200px_1fr] gap-4"

// Transitions
"transition-all duration-300 ease-out"
"transition-colors duration-200"
"transition-transform duration-200 hover:scale-105"

// Shadows
"shadow-sm"
"shadow-md hover:shadow-lg"
"shadow-xl"

// Borders
"border border-border rounded-lg"
"border-2 border-primary"
"divide-y divide-border"
```

## Form Patterns

### Input with Label

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter email"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>
```

### Input with Error

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    className={error ? "border-destructive" : ""}
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
  {error && (
    <p className="text-sm text-destructive">{error}</p>
  )}
</div>
```

### Select with Placeholder

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```
