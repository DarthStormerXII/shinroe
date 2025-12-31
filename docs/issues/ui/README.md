# UI Issues & Learnings

> **Scope:** React, Next.js, shadcn/ui, Tailwind CSS, styling, components, state management
>
> **Reusable:** ✅ Yes - Copy this folder to other projects

---

## Quick Reference

| ID | Title | Tags |
|----|-------|------|
| UI-001 | Image Placeholder System | `images`, `ai-generation`, `placeholders` |
| UI-002 | Transaction Toast with Explorer Links | `transactions`, `sonner`, `toast` |
| UI-003 | Test-First Integration Approach | `testing`, `integration`, `validation` |
| UI-004 | Multilingual i18n Pitfalls | `i18n`, `localization`, `multilingual` |

---

## Issues

## [UI-001] Image Placeholder System for AI-Generated Images

**Problem:** Claude cannot generate images. When building UI that requires custom images (not icons), the generated code either uses broken image paths, placeholder boxes, or skips images entirely. This leads to incomplete designs that require manual intervention.

**Root Cause:** AI assistants can generate code but not images. There's no systematic approach to handle image requirements during code generation.

**Solution:** Implement an image placeholder system:

1. **Create a prompts directory:**
   ```
   frontend/public/images/
   └── _prompts/
       └── prompts.json
   ```

2. **prompts.json format:**
   ```json
   {
     "images": [
       {
         "path": "/images/hero-banner.png",
         "prompt": "Modern gradient hero banner with abstract shapes, purple and coral colors, 1920x600px",
         "size": "1920x600",
         "usage": "Landing page hero section"
       },
       {
         "path": "/images/empty-state.svg",
         "prompt": "Minimal illustration of empty inbox, line art style, single color",
         "size": "400x300",
         "usage": "Empty state for message list"
       }
     ]
   }
   ```

3. **In code, use placeholder with alt text:**
   ```tsx
   <div className="relative w-full h-[300px] bg-muted rounded-lg flex items-center justify-center">
     <span className="text-muted-foreground text-sm">
       [Image: Hero banner - see /images/_prompts/prompts.json]
     </span>
   </div>
   ```

4. **After generating images, replace with:**
   ```tsx
   <Image src="/images/hero-banner.png" alt="Hero banner" fill className="object-cover" />
   ```

**Prevention:**
- Before generating any UI, ask: "Does this need custom images (not icons)?"
- If yes, create the prompts.json entry FIRST
- Use visible placeholders that reference the prompts file
- Never use broken image paths or invisible placeholders

**Tags:** `images`, `ai-generation`, `placeholders`, `design`

**Related Files:**
- `frontend/public/images/_prompts/prompts.json`

---

## [UI-002] Transaction Toast with Explorer Links

**Problem:** Transactions are sent but users have no feedback or way to verify them on the blockchain explorer. Different parts of the codebase handle transaction feedback inconsistently.

**Root Cause:** No standardized pattern for transaction notifications across the application.

**Solution:** EVERY transaction must use Sonner toast with an action button linking to the explorer.

1. **Create a utility function:**
   ```typescript
   // lib/utils/transaction-toast.ts
   import { toast } from "sonner"
   import { ExternalLink } from "lucide-react"

   interface TxToastParams {
     hash: string
     explorerUrl: string  // e.g., "https://veryscan.io"
     title?: string
   }

   export function showTxToast({ hash, explorerUrl, title = "Transaction Sent" }: TxToastParams) {
     toast.success(title, {
       description: `${hash.slice(0, 10)}...${hash.slice(-8)}`,
       action: {
         label: "View",
         onClick: () => window.open(`${explorerUrl}/tx/${hash}`, "_blank")
       },
       duration: 10000
     })
   }

   export function showTxPending(message = "Confirming transaction...") {
     return toast.loading(message)
   }

   export function showTxError(error: Error | string) {
     toast.error("Transaction Failed", {
       description: typeof error === "string" ? error : error.message
     })
   }
   ```

2. **Usage in components:**
   ```typescript
   const handleSend = async () => {
     const toastId = showTxPending()
     try {
       const hash = await sendTransaction(...)
       toast.dismiss(toastId)
       showTxToast({ hash, explorerUrl: EXPLORER_URL })
     } catch (error) {
       toast.dismiss(toastId)
       showTxError(error)
     }
   }
   ```

3. **For API routes / server-side:**
   - Return the transaction hash to the client
   - Client handles the toast display

**Prevention:**
- Search for ALL transaction sends: `sendTransaction`, `writeContract`, `signAndSubmit`
- Ensure each one uses the standardized toast utility
- Never send a transaction without user feedback

**Tags:** `transactions`, `sonner`, `toast`, `explorer`, `ux`

**Related Files:**
- `frontend/lib/utils/transaction-toast.ts`
- `frontend/constants/index.ts` (explorer URLs)

---

## [UI-003] Test-First Integration Approach

**Problem:** Code is generated that calls APIs, subgraphs, or external services without verifying they work. This leads to runtime errors, wrong data types, and debugging time waste.

**Root Cause:** Generating integration code without first testing the endpoints manually.

**Solution:** Before writing ANY integration code, follow this checklist:

### For Subgraph Queries:
```bash
# 1. Test the query first
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users(first: 5) { id address } }"}' \
  https://your-subgraph-endpoint/subgraphs/name/your-subgraph

# 2. Document the response schema
# 3. Create TypeScript types matching the ACTUAL response
# 4. Then write the frontend code
```

### For REST APIs:
```bash
# 1. Test each endpoint
curl -X GET https://api.example.com/endpoint \
  -H "Authorization: Bearer $TOKEN"

# 2. Save the response, understand the schema
# 3. Create types from actual response
# 4. Then integrate
```

### For Contract Interactions:
```bash
# 1. Test read functions via cast
cast call $CONTRACT_ADDRESS "functionName()" --rpc-url $RPC_URL

# 2. Test write functions on testnet first
cast send $CONTRACT_ADDRESS "functionName(uint256)" 123 \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# 3. Verify events are emitted correctly
# 4. Then integrate in frontend
```

### Validation Checklist:
- [ ] Endpoint is accessible
- [ ] Authentication works (if required)
- [ ] Response schema matches expected types
- [ ] Error cases are handled
- [ ] Rate limits are understood
- [ ] All CRUD operations tested (if applicable)

**Prevention:**
- NEVER write integration code without testing the endpoint first
- Always create types from ACTUAL responses, not assumed schemas
- Test every API route after writing it
- Document any discrepancies between expected and actual behavior

**Tags:** `testing`, `integration`, `validation`, `api`, `subgraph`

**Related Files:**
- All files in `frontend/lib/services/`
- All files in `frontend/app/api/`

---

## [UI-004] Multilingual i18n Pitfalls

**Problem:** After setting up i18n, translations fail silently. Raw keys appear in UI, dates stay in default locale, entire sections remain untranslated. Causes painful debugging cycles across all supported languages.

---

### Pitfall 1: Translation Keys Don't Match Code-Generated Values

Dynamic keys built from API responses or enums don't exist in translation files.

```typescript
// ❌ API returns 'identity', translation file has 'onchain'
const categoryKey = data.category // 'identity' from API
t(`categories.${categoryKey}.name`) // looks for categories.identity.name - FAILS

// ✅ Always verify API response values match translation keys
// Or create a mapping layer:
const API_TO_I18N_MAP = {
  'identity': 'identity',
  'on-chain': 'onchain',  // handle mismatches explicitly
}
```

**Fix:** Console.log your dynamic keys during development. Verify they exist in translation files.

---

### Pitfall 2: Using Config/Constant Objects Instead of t()

Components display values from metadata objects directly.

```typescript
// ❌ METADATA.name is always in default language
const config = ITEM_METADATA[itemType]
return <h3>{config.name}</h3>

// ✅ Map types to translation keys
const ITEM_KEYS = ['typeA', 'typeB', 'typeC'] as const
return <h3>{t(`itemNames.${ITEM_KEYS[itemType]}`)}</h3>
```

**Fix:** Never render `.name`, `.label`, `.title`, `.description` from config objects. Route through `t()`.

---

### Pitfall 3: Hardcoded Locale in Date/Time Formatting

Dates ignore the current locale setting.

```typescript
// ❌ Always formats in English
new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ✅ Use locale from translation context
const { locale } = useTranslation()
const localeMap = { en: 'en-US', ko: 'ko-KR', ja: 'ja-JP', zh: 'zh-CN' }
new Date(ts).toLocaleDateString(localeMap[locale], { month: 'short', day: 'numeric' })
```

**Fix:** Create a `formatDate(date, locale)` utility. Use it everywhere.

---

### Pitfall 4: Asymmetric Translation Files

Keys exist in one language but not others.

```typescript
// en.json has 10 tier names, es.json has only 6
// Result: Spanish users see raw keys for 4 tiers

// ✅ After adding ANY key, immediately add to ALL locale files
// Use a script to validate key parity:
// node scripts/validate-i18n.js
```

**Fix:** Create a validation script that compares keys across all locale files. Run before deploy.

---

### Pitfall 5: Wallet/Auth UI Forgotten

Connect button, wallet dropdown, auth modals are almost always overlooked.

```typescript
// ❌ These are ALWAYS forgotten:
<Button>Connect Wallet</Button>
<DropdownMenuItem>Copy Address</DropdownMenuItem>
<DropdownMenuItem>Disconnect</DropdownMenuItem>
<span>Connecting...</span>

// ✅ Wallet-specific keys needed:
// wallet.connect, wallet.connecting, wallet.connected
// wallet.disconnect, wallet.disconnecting
// wallet.copyAddress, wallet.copied
// wallet.viewExplorer, wallet.switchNetwork
```

---

### Pitfall 6: Language Switcher Uses Abbreviations

Non-English users expect to see their language in their script.

```typescript
// ❌ English abbreviations for all languages
{ en: 'EN', ko: 'KR', ja: 'JP', zh: 'CN', ar: 'AR' }

// ✅ Native script for each language
{ en: 'EN', ko: '한국어', ja: '日本語', zh: '中文', ar: 'العربية' }
```

---

### Pitfall 7: No Browser Locale Detection

First-time users always see default language.

```typescript
// ✅ Detect on first visit
useEffect(() => {
  const saved = localStorage.getItem('locale')
  if (!saved) {
    const browserLang = navigator.language.split('-')[0] // 'en', 'ko', 'ja'
    const supported = ['en', 'ko', 'ja', 'zh']
    const detected = supported.includes(browserLang) ? browserLang : 'en'
    setLocale(detected)
    localStorage.setItem('locale', detected)
  }
}, [])
```

---

### Pitfall 8: String Concatenation Instead of Interpolation

Word order differs across languages.

```typescript
// ❌ English word order baked in
`Showing ${current} of ${total} items`
// Works: "Showing 5 of 20 items"
// Breaks in Japanese: needs "20件中5件を表示"

// ✅ Use interpolation - let translators control order
t('pagination.showing', { current, total })

// en.json: "Showing {current} of {total} items"
// ja.json: "{total}件中{current}件を表示"
// ar.json: "عرض {current} من {total} عنصر"  // RTL language
```

---

### Pitfall 9: Pluralization Ignored

Different languages have different plural rules.

```typescript
// ❌ Simple singular/plural (English-only logic)
`${count} item${count !== 1 ? 's' : ''}`

// ✅ Use i18n library's plural support
t('items.count', { count })

// en.json: { "one": "{count} item", "other": "{count} items" }
// ru.json: { "one": "...", "few": "...", "many": "...", "other": "..." }
// ar.json: { "zero": "...", "one": "...", "two": "...", "few": "...", "many": "...", "other": "..." }
```

---

### Pitfall 10: Transaction Toasts Left Hardcoded

Transaction notifications (loading, success, error) are almost always hardcoded English.

```typescript
// ❌ Hardcoded toast messages (VERY common miss)
const toastId = toast.loading('Waiting for wallet confirmation...')
toast.success('Transaction Successful!', {
  action: { label: 'View', onClick: () => ... }
})
toast.error('Transaction Failed', { description: error.message })

// ✅ Use translation keys
const { t } = useTranslation()
const toastId = toast.loading(t('transaction.waitingConfirmation'))
toast.success(t('transaction.success'), {
  action: { label: t('transaction.view'), onClick: () => ... }
})
toast.error(t('transaction.failed'), { description: error.message })
```

**Required translation keys:**
```json
{
  "transaction": {
    "waitingConfirmation": "Waiting for wallet confirmation...",
    "success": "Transaction Successful!",
    "failed": "Transaction Failed",
    "view": "View",
    "switchChainFailed": "Failed to switch chain",
    "errorOccurred": "An error occurred"
  }
}
```

**Why this gets missed:**
- Transaction code is in utility files, not component files
- Toasts feel like "system messages" not "UI text"
- Often added late in development when i18n is "done"

**Fix:** Search for ALL `toast.loading`, `toast.success`, `toast.error` calls. Every string must use `t()`.

---

## Pre-Ship Checklist

### Translation Files
- [ ] All keys exist in ALL locale files (run validation script)
- [ ] Dynamic keys (from API/enums) match translation keys
- [ ] Wallet/auth keys complete
- [ ] Error messages translated
- [ ] Empty/loading states translated

### Components
- [ ] Connect button + dropdown
- [ ] Language switcher (native text, not abbreviations)
- [ ] All cards (titles, descriptions, status labels)
- [ ] All lists (filters, sorts, counts, empty states)
- [ ] All modals/dialogs
- [ ] All forms (labels, placeholders, validation errors)
- [ ] All toasts/notifications (especially transaction toasts!)

### Formatting
- [ ] All dates use locale from context
- [ ] All numbers use locale formatting if needed
- [ ] Pluralization handled properly

### First Visit
- [ ] Browser locale detected
- [ ] Falls back to default for unsupported locales
- [ ] Preference persisted

---

## Validation Script

```javascript
// scripts/validate-i18n.js
const fs = require('fs')
const path = require('path')

const localesDir = './lib/i18n/messages'
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'))

const allKeys = {}
files.forEach(file => {
  const locale = file.replace('.json', '')
  const content = JSON.parse(fs.readFileSync(path.join(localesDir, file)))
  allKeys[locale] = new Set(flattenKeys(content))
})

const locales = Object.keys(allKeys)
const baseLocale = locales[0]
let hasErrors = false

locales.forEach(locale => {
  if (locale === baseLocale) return

  const missing = [...allKeys[baseLocale]].filter(k => !allKeys[locale].has(k))
  const extra = [...allKeys[locale]].filter(k => !allKeys[baseLocale].has(k))

  if (missing.length) {
    console.error(`❌ ${locale}.json missing: ${missing.join(', ')}`)
    hasErrors = true
  }
  if (extra.length) {
    console.warn(`⚠️  ${locale}.json has extra: ${extra.join(', ')}`)
  }
})

if (!hasErrors) console.log('✅ All locales have matching keys')
process.exit(hasErrors ? 1 : 0)

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? flattenKeys(v, `${prefix}${k}.`) : `${prefix}${k}`
  )
}
```

**Tags:** `i18n`, `localization`, `multilingual`, `internationalization`

---

