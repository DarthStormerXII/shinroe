# Very Design System

**MANDATORY: Reference this design system for ALL UI work.**

---

## Color Tokens (MUST USE)

### Main Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **coral** | `#ff6d75` | `--color-coral` | Primary accent, CTAs |
| **violet** | `#7c60fd` | `--color-violet` | Secondary accent |
| **violet-light** | `#9d87ff` | `--color-violet-light` | Hover states |
| **red** | `#f72349` | `--color-red` | Errors, destructive |
| **yellow** | `#feea46` | `--color-yellow` | Warnings, pending |
| **green** | `#4be15a` | `--color-green` | Success |
| **disable-bg** | `#994146` | `--color-disable` | Disabled coral state |

### Gradients

| Name | Value | Usage |
|------|-------|-------|
| **gra-main** | `linear-gradient(140deg, #ff6d75 50%, #9c86ff 96%)` | Primary gradient |
| **bg-gra** | `linear-gradient(109deg, #1d212b 13%, #292347 87%)` | Background gradient |

### Greyscale (Dark Mode)

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **black-100** | `#171b25` | `--background` | Page background |
| **black-90** | `#1f2329` | `--card` | Card backgrounds |
| **black-80** | `#292d33` | `--border` | Lines, borders |
| **black-70** | `#333941` | `--muted` | Disabled backgrounds |
| **black-60** | `#505966` | `--muted-foreground` | Disabled icons, lines |
| **black-50** | `#a0a4a9` | `--secondary-foreground` | Standard text |
| **black-40** | `#adb2b8` | `--foreground` | Primary text |
| **black-30** | `#bec3c9` | - | Subtitles |
| **black-20** | `#dce2e5` | - | Labels |
| **black-10** | `#e5e9f1` | - | Light backgrounds |
| **black-0** | `#f6f8fd` | - | Near-white |
| **white** | `#ffffff` | `--primary-foreground` | White text on colors |

### Modal Overlay

| Name | Value | Usage |
|------|-------|-------|
| **modal-dark** | `rgba(9,9,9,0.8)` | Modal backdrop |

---

## Typography

| Style | Font | Weight | Size | Letter Spacing |
|-------|------|--------|------|----------------|
| **h3** | Poppins | 700 | 16px | -0.32px |
| **h2** | Poppins | 700 | 40px | -0.6px |
| **subtitle** | Poppins | 700 | 13px | -0.26px |
| **body** | Poppins | 700 | 15px | -0.3px |
| **body-kr** | Noto Sans KR | 400 | 15px | -1.2px |

---

## Tailwind Integration

Add to `frontend/app/globals.css`:

```css
:root {
  /* Main colors */
  --color-coral: 255 109 117;
  --color-violet: 124 96 253;
  --color-violet-light: 157 135 255;
  --color-red: 247 35 73;
  --color-yellow: 254 234 70;
  --color-green: 75 225 90;
  --color-disable: 153 65 70;

  /* Dark mode greyscale */
  --background: 23 27 37;
  --foreground: 173 178 184;
  --card: 31 35 41;
  --card-foreground: 173 178 184;
  --popover: 31 35 41;
  --popover-foreground: 173 178 184;
  --primary: 255 109 117;
  --primary-foreground: 255 255 255;
  --secondary: 124 96 253;
  --secondary-foreground: 255 255 255;
  --muted: 51 57 65;
  --muted-foreground: 80 89 102;
  --accent: 157 135 255;
  --accent-foreground: 255 255 255;
  --destructive: 247 35 73;
  --destructive-foreground: 255 255 255;
  --border: 41 45 51;
  --input: 41 45 51;
  --ring: 124 96 253;

  --radius: 8px;
}
```

Add to `frontend/tailwind.config.ts`:

```typescript
colors: {
  coral: 'rgb(var(--color-coral) / <alpha-value>)',
  violet: 'rgb(var(--color-violet) / <alpha-value>)',
  'violet-light': 'rgb(var(--color-violet-light) / <alpha-value>)',
}
```

---

## Component Patterns

### Use Design Tokens

- **Never hardcode colors** - use CSS variables
- **Reference Shinroe's existing components** for patterns

### Common Patterns

| Component | Reference |
|-----------|-----------|
| Button | `frontend/components/ui/button.tsx` |
| Input | `frontend/components/ui/input.tsx` |
| Modal | `frontend/components/ui/dialog.tsx` |
| Card | `frontend/components/ui/card.tsx` |

---

## Anti-Patterns

```tsx
// NEVER hardcode colors
<div className="bg-[#171b25]">  // BAD

// Use design tokens
<div className="bg-background">  // GOOD

// NEVER guess gradients
<div style={{background: 'linear-gradient(...)'}}>  // BAD

// Use exact values from this file
<div className="bg-gradient-to-br from-coral to-violet-light">  // GOOD
```

---

## Workflow Summary

1. **New Component?** → Check Shinroe's existing components first
2. **Styling?** → Use color tokens from this file
3. **Icons?** → Use lucide-react icons
4. **Layout?** → Check Shinroe's existing layouts for patterns
5. **Unsure?** → Look at Shinroe's implementation
