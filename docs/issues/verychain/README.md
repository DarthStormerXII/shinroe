# VeryChain Issues & Learnings

> **Scope:** WEPIN authentication, VeryChat API, VeryChain network, VeryChain-specific integrations
>
> **Reusable:** ❌ No - VeryChain hackathon specific only

---

## Quick Reference

| ID | Title | Tags |
|----|-------|------|
| VERY-001 | Korean i18n Pitfalls & Checklist | `i18n`, `korean`, `pitfalls` |
| VERY-002 | VeryChat Widget Z-Index Dialog Management | `verychat`, `dialog`, `z-index` |

---

## Categories

### WEPIN Authentication
Issues related to WEPIN SDK, wallet creation, authentication flow, session management

### VeryChat API
Issues related to VeryChat messaging API, WebSocket connections, message handling

### VeryChain Network
Issues related to VeryChain RPC, chain configuration, block explorer, transaction handling

### UI/UX (VeryChain-specific)
Issues related to Korean localization and VeryChat UI interactions

---

## Issues

## [VERY-001] Korean i18n Pitfalls & Checklist

**Category:** UI/UX (VeryChain-specific)

**Problem:** After setting up i18n, translations fail silently. Raw keys appear in UI (`tiers.building`, `categories.identity.name`), dates stay English, sections remain untranslated. Causes painful debugging cycles.

---

### Pitfall 1: Translation Key Mismatches

Code generates keys that don't exist in translation files.

```typescript
// ❌ Code expects 'identity', but translation file has 'onchain'
const categoryKey = score.category // returns 'identity' from API
t(`categories.${categoryKey}.name`) // fails silently, shows raw key

// ✅ Ensure translation keys match API/code-generated values exactly
// Check what the API actually returns, not what you assume
```

**Fix:** Always verify what keys your code generates match what's in your JSON files. API responses often use different naming than you expect.

---

### Pitfall 2: Using Config Objects Instead of Translations

Components use metadata constants directly instead of `t()`.

```typescript
// ❌ BAD - config.name is always English
const config = BADGE_METADATA[badgeType]
return <h3>{config.name}</h3>  // Always "Verified Member"

// ✅ GOOD - Map enum/index to translation keys
const BADGE_KEYS = ['verifiedMember', 'powerUser', 'socialStar'] as const
const badgeKey = BADGE_KEYS[badgeType]
return <h3>{t(`badgeNames.${badgeKey}`)}</h3>
```

**Fix:** Never display `.name`, `.label`, `.title` from config objects. Always route through `t()`.

---

### Pitfall 3: Hardcoded Date Formatting

Dates always render in English regardless of locale.

```typescript
// ❌ BAD - Always English
new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
// "Dec 27"

// ✅ GOOD - Use locale from context
const { locale } = useTranslation()
new Date(ts).toLocaleDateString(
  locale === 'ko' ? 'ko-KR' : 'en-US',
  { month: 'short', day: 'numeric' }
)
// "12월 27일"
```

**Fix:** Every `toLocaleDateString()` and `toLocaleTimeString()` must use locale from translation context.

---

### Pitfall 4: Missing Translation Entries

Keys exist in one language file but not the other.

```typescript
// Common missing entries we discovered:
"tiers": {
  "newcomer": "...",
  "established": "...",
  // ❌ MISSING - caused raw key display:
  // "building", "excellent", "good", "at_risk"
}
```

**Fix:** After adding any key to en.json, immediately add to ko.json (and vice versa).

---

### Pitfall 5: Connect Button Forgotten

Wallet connection UI is almost always overlooked.

```typescript
// ❌ Hardcoded - very common mistake
<Button>Connect Wallet</Button>
<DropdownMenuItem>Copy Address</DropdownMenuItem>
<DropdownMenuItem>Disconnect</DropdownMenuItem>

// ✅ Translated
<Button>{t('wallet.connect')}</Button>
<DropdownMenuItem>{t('wallet.copyAddress')}</DropdownMenuItem>
```

**Required wallet keys:**
- `wallet.connect`, `wallet.connecting`, `wallet.disconnect`, `wallet.disconnecting`
- `wallet.copyAddress`, `wallet.copied`, `wallet.viewExplorer`, `wallet.gasPrice`

---

### Pitfall 6: Language Switcher Shows "KR"

Korean users expect Korean text, not English abbreviations.

```typescript
// ❌ BAD
{ en: 'EN', ko: 'KR' }

// ✅ GOOD - Native text
{ en: 'EN', ko: '한국' }
```

---

### Pitfall 7: No Browser Language Detection

First-time Korean users see English by default.

```typescript
// ✅ Detect browser language on first visit
useEffect(() => {
  const saved = localStorage.getItem('locale')
  if (!saved) {
    const browserLang = navigator.language || ''
    const detected = browserLang.startsWith('ko') ? 'ko' : 'en'
    setLocale(detected)
    localStorage.setItem('locale', detected)
  }
}, [])
```

---

## Pre-Ship Checklist

### Translation Files
- [ ] All keys in en.json exist in ko.json
- [ ] All tier names: `newcomer`, `established`, `trusted`, `elite`, `excellent`, `good`, `building`, `at_risk`
- [ ] Category keys match API response values (not assumed names)
- [ ] Wallet keys: `connect`, `connecting`, `disconnect`, `copyAddress`, `copied`, `viewExplorer`

### Components (commonly missed)
- [ ] Connect button + dropdown menu
- [ ] Language switcher (shows "한국" not "KR")
- [ ] Badge cards (names, descriptions, progress units, earned dates)
- [ ] List filters/sorts ("All Types", "Most Recent", "Showing X of Y")
- [ ] Settings sections (VeryChat Integration, Privacy Settings)
- [ ] Empty states ("No results", "No data")
- [ ] Loading states ("Loading...", "Connecting...")

### Dates
- [ ] Every `toLocaleDateString()` uses locale from context
- [ ] Every `toLocaleTimeString()` uses locale from context

### First Visit
- [ ] Detects `navigator.language`
- [ ] Korean browser → Korean default
- [ ] Saves preference to localStorage

---

## Testing Procedure

1. Clear localStorage
2. Set browser to Korean
3. Open app → should be Korean by default
4. Navigate ALL pages, look for English text
5. Open ALL modals/dialogs
6. Test wallet: disconnected → connecting → connected → dropdown
7. Switch to English, refresh, verify persistence

**Tags:** `i18n`, `korean`, `pitfalls`, `checklist`

---

## [VERY-002] VeryChat Widget Z-Index Dialog Management

**Category:** VeryChat

**Problem:** When a VeryChat transaction is triggered, it opens a widget/modal for transaction confirmation. If there's already a dialog open in the app (e.g., a settings modal, confirmation dialog), the VeryChat widget appears BEHIND the existing dialog. Users cannot click on the VeryChat widget to confirm/reject the transaction, causing the app to appear frozen.

**Root Cause:** Z-index conflict between app dialogs and VeryChat widget. The VeryChat widget doesn't have a high enough z-index, or the app dialogs are not closed before triggering transactions.

**Solution:** Close all app dialogs before triggering any VeryChat transaction.

1. **Create a dialog state manager:**
   ```typescript
   // lib/stores/dialog-store.ts
   import { create } from "zustand"

   interface DialogStore {
     openDialogs: string[]
     openDialog: (id: string) => void
     closeDialog: (id: string) => void
     closeAllDialogs: () => void
     isDialogOpen: (id: string) => boolean
   }

   export const useDialogStore = create<DialogStore>((set, get) => ({
     openDialogs: [],
     openDialog: (id) => set((state) => ({
       openDialogs: [...state.openDialogs, id]
     })),
     closeDialog: (id) => set((state) => ({
       openDialogs: state.openDialogs.filter(d => d !== id)
     })),
     closeAllDialogs: () => set({ openDialogs: [] }),
     isDialogOpen: (id) => get().openDialogs.includes(id),
   }))
   ```

2. **Create a transaction wrapper:**
   ```typescript
   // lib/utils/verychat-transaction.ts
   import { useDialogStore } from "@/lib/stores/dialog-store"

   export async function executeVeryChatTransaction<T>(
     transactionFn: () => Promise<T>
   ): Promise<T> {
     const { openDialogs, closeAllDialogs } = useDialogStore.getState()
     const previousDialogs = [...openDialogs]

     // Close all dialogs before transaction
     closeAllDialogs()

     // Small delay to ensure dialogs are closed
     await new Promise(resolve => setTimeout(resolve, 100))

     try {
       const result = await transactionFn()
       return result
     } finally {
       // Optionally re-open dialogs after transaction completes
       // (usually not needed as user flow continues)
     }
   }
   ```

3. **Wrap all Dialog components:**
   ```tsx
   // components/ui/managed-dialog.tsx
   import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
   import { useDialogStore } from "@/lib/stores/dialog-store"
   import { useEffect } from "react"

   interface ManagedDialogProps {
     id: string
     children: React.ReactNode
     // ... other dialog props
   }

   export function ManagedDialog({ id, children, ...props }: ManagedDialogProps) {
     const { isDialogOpen, openDialog, closeDialog, openDialogs } = useDialogStore()
     const isOpen = isDialogOpen(id)

     return (
       <Dialog
         open={isOpen}
         onOpenChange={(open) => open ? openDialog(id) : closeDialog(id)}
         {...props}
       >
         {children}
       </Dialog>
     )
   }
   ```

4. **Usage in transaction triggers:**
   ```typescript
   const handleSendTransaction = async () => {
     await executeVeryChatTransaction(async () => {
       // This will close all dialogs first, then execute
       const result = await verychatSdk.sendTransaction(...)
       return result
     })
   }
   ```

5. **CSS fallback (ensure VeryChat widget has high z-index):**
   ```css
   /* globals.css */
   /* VeryChat widget should always be on top */
   [data-verychat-widget],
   .verychat-modal,
   .verychat-overlay {
     z-index: 99999 !important;
   }
   ```

**Prevention:**
- ALWAYS use `executeVeryChatTransaction()` wrapper for VeryChat transactions
- Use `ManagedDialog` instead of raw `Dialog` components
- Test transaction flows with dialogs open
- Check z-index hierarchy when adding new modals

**Tags:** `verychat`, `dialog`, `z-index`, `modal`, `transactions`

**Related Files:**
- `frontend/lib/stores/dialog-store.ts`
- `frontend/lib/utils/verychat-transaction.ts`
- `frontend/components/ui/managed-dialog.tsx`
- `frontend/app/globals.css`

---

