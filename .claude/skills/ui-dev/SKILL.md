---
name: ui-dev
description: Build UI components with dark theme, shadcn/ui, animations, and responsive design (project)
---

# UI Development Skill

## CRITICAL: Design System (CHECK FIRST)

**BEFORE writing ANY UI code, reference the Very Design System in `design-system.md`.**

Use the color tokens and patterns defined there. Never hardcode colors.

---

## CRITICAL: File Size Limits

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Before writing any component:
1. If file would exceed 300 lines → decompose FIRST
2. If component has 3+ useState → extract to hook
3. If component has tabs/sections → split into separate files

See **code-structure** skill for detailed decomposition patterns.

## BEFORE WRITING ANY CODE

**MANDATORY: Check shadcn/ui via Context7 before building any UI component.**

```
1. ALWAYS check if shadcn/ui has the component first:
   mcp__context7__resolve-library-id({ libraryName: "shadcn-ui" })

   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/shadcn-ui/ui",
     topic: "button",  // or dialog, card, input, select, etc.
     mode: "code"
   })

2. If shadcn has it: use their component, don't build custom
3. If shadcn doesn't have it: build custom following their patterns
4. For Tailwind utilities:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/tailwindlabs/tailwindcss",
     topic: "flexbox",
     mode: "code"
   })

5. NEVER guess component APIs or Tailwind classes - verify with Context7
```

**Component Lookup Workflow:**
- Button? Check shadcn: `topic: "button"`
- Modal? Check shadcn: `topic: "dialog"`
- Form inputs? Check shadcn: `topic: "input"`, `topic: "select"`, `topic: "checkbox"`
- Data display? Check shadcn: `topic: "table"`, `topic: "card"`
- Feedback? Check shadcn: `topic: "toast"`, `topic: "alert"`

---

## When to Use This Skill

Load this skill when:
- Creating new React components
- Styling existing components
- Adding animations or transitions
- Building responsive layouts
- Working with shadcn/ui components

## Core Rules

1. **shadcn/ui First** - Always check if a component exists before building custom
2. **Dark Theme Only** - Use CSS variables, never hardcode colors
3. **Mobile First** - Start with mobile layout, add breakpoints up
4. **Semantic HTML** - Use correct elements (button, nav, main, etc.)
5. **Accessible** - Include aria labels, keyboard navigation, focus states

## Decision Tree

```
Need a new component?
├─ Is it a form element? → Check shadcn/ui first
├─ Is it a layout? → Use CSS Grid/Flexbox with responsive breakpoints
├─ Is it interactive? → Add hover states + transitions
└─ Is it loading data? → Add skeleton + loading state

Need to style something?
├─ Color → Use theme variables (--primary, --muted, etc.)
├─ Spacing → Use Tailwind scale (p-4, gap-6, etc.)
├─ Animation → Use predefined keyframes or transition-all
└─ Responsive → Mobile-first: base → md: → lg:
```

## Common Tasks

### Adding a New Component

1. Look up shadcn/ui components via Context7 first
2. If shadcn has it: `cd frontend && npx shadcn@latest add <name>`
3. If custom: create file at `components/<category>/<name>.tsx`
4. Use theme variables for colors (never hardcode)
5. Add responsive breakpoints (mobile-first)
6. Include loading and error states

### Adding a Form

1. Look up shadcn/ui form components via Context7
2. Install needed components: `npx shadcn@latest add input label select`
3. Use `<Label>` with `htmlFor` matching input `id`
4. Add error state styling with `border-destructive`
5. Handle loading state on submit button

### Adding Animation

1. Check existing keyframes in `tailwind.config.ts`
2. If exists: use `animate-{name}` class
3. If new: add keyframe to tailwind.config.ts first
4. For hover effects: use `transition-all duration-300`

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | kebab-case.tsx | `user-profile.tsx` |
| Hooks | use-kebab-case.ts | `use-modal.ts` |
| Utils | kebab-case.ts | `format-date.ts` |

## Anti-Patterns (NEVER DO)

```tsx
// NEVER hardcode colors
<div className="bg-gray-900 text-white">

// Use theme variables
<div className="bg-background text-foreground">

// NEVER use inline styles for theming
<div style={{ backgroundColor: '#1a1a1a' }}>

// Use Tailwind classes
<div className="bg-card">

// NEVER skip loading states
{data && <Component data={data} />}

// Handle all states
{loading ? <Skeleton /> : error ? <Error /> : <Component data={data} />}

// NEVER forget mobile
<div className="flex gap-8">  // Too much gap on mobile

// Responsive spacing
<div className="flex gap-4 md:gap-8">
```

## Installing shadcn Components

```bash
cd frontend && npx shadcn@latest add button card dialog input select tabs toast
```

Common components: `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `skeleton`, `table`, `tabs`, `toast`, `tooltip`

## Theme System

All colors use HSL CSS variables defined in `frontend/app/globals.css`:

| Variable | Usage | Example Class |
|----------|-------|---------------|
| `--background` | Page background | `bg-background` |
| `--foreground` | Primary text | `text-foreground` |
| `--card` | Card backgrounds | `bg-card` |
| `--primary` | Primary actions | `bg-primary text-primary-foreground` |
| `--secondary` | Secondary elements | `bg-secondary` |
| `--muted` | Muted text/backgrounds | `text-muted-foreground bg-muted` |
| `--accent` | Hover states | `hover:bg-accent` |
| `--destructive` | Error/danger | `bg-destructive text-destructive-foreground` |
| `--border` | Borders | `border-border` |

## Animation System

Predefined keyframes in `tailwind.config.ts`:

| Animation | Class | Use Case |
|-----------|-------|----------|
| Fade In | `animate-fade-in` | Modal overlays, toasts |
| Slide Up | `animate-slide-in-bottom` | Drawers, sheets |
| Scale In | `animate-scale-in` | Modals, popovers |
| Bounce In | `animate-bounce-in` | Success states |
| Shimmer | `animate-shimmer` | Loading skeletons |
| Float | `animate-float` | Decorative elements |
| Spin | `animate-spin` | Loading spinners |

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| (default) | 0px | Mobile phones |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

## Quick Reference

| Task | Solution |
|------|----------|
| Add component | `cd frontend && npx shadcn@latest add <name>` |
| Custom color | Add to globals.css + tailwind.config.ts |
| Icon | `import { IconName } from 'lucide-react'` |
| Icon sizes | `h-4 w-4` (sm), `h-5 w-5` (md), `h-6 w-6` (lg) |
| Hover effect | `transition-all duration-300 hover:...` |
| Focus ring | `focus:ring-2 focus:ring-primary focus:ring-offset-2` |
