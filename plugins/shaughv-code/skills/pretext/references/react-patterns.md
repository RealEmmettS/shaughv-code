# React Integration Patterns

Complete React integration patterns for `@chenglou/pretext`, proven across 7+ production projects (QubeTX Landing, emmetts_personal_website, resume-2026, speedtest, shaughv-vintage, raw-materials-processor, MAGZ-26).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [useContainerWidth Hook](#usecontainerwidth-hook)
- [usePretext Hook](#usepretext-hook)
- [PretextProvider](#pretextprovider)
- [PretextBlock Component](#pretextblock-component)
- [Resize Coordinator](#resize-coordinator)
- [Usage Examples](#usage-examples)
- [What NOT to Measure](#what-not-to-measure)
- [Testing Patterns](#testing-patterns)

## Architecture Overview

The React integration consists of 4 interconnected pieces:

```
PretextProvider (font readiness context)
  └── PretextBlock (drop-in wrapper)
        ├── useContainerWidth (sync width measurement)
        └── usePretext (prepare/layout access)
```

**Key principles:**
- All enhancements are purely additive (`min-height`, narrower `max-width`)
- Graceful degradation: if Pretext isn't ready, render exactly as before
- Hydration-safe: server-rendered HTML has no Pretext styles, enhancements apply via `useEffect`
- **NO ResizeObserver anywhere** — sync DOM reads with RAF gate

## useContainerWidth Hook

The most error-prone piece. MUST NOT use ResizeObserver (causes vibration loop with shrinkwrap).

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'

type UseContainerWidthResult = [
  refCallback: (el: HTMLElement | null) => void,
  width: number | null,
]

export function useContainerWidth(): UseContainerWidthResult {
  const elementRef = useRef<HTMLElement | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const measure = useCallback(() => {
    const el = elementRef.current
    if (!el) return

    // When element has max-width from shrinkwrap, temporarily clear it
    // to read the unconstrained container width.
    // No visual flash — browser doesn't paint mid-JS execution.
    const savedMaxWidth = el.style.maxWidth
    el.style.maxWidth = 'none'
    const w = el.clientWidth
    el.style.maxWidth = savedMaxWidth

    setWidth(w)
  }, [])

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      measure()
    })
  }, [measure])

  const refCallback = useCallback(
    (el: HTMLElement | null) => {
      elementRef.current = el
      if (el) measure() // immediate sync read on mount
    },
    [measure],
  )

  useEffect(() => {
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      window.removeEventListener('resize', scheduleMeasure)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [scheduleMeasure])

  return [refCallback, width]
}
```

**Why ref callback instead of `useRef`:** Ref callbacks fire immediately when the element mounts, giving us a synchronous width read before the first paint.

**Why temporary `maxWidth = 'none'`:** When shrinkwrap has already been applied, reading `clientWidth` would return the constrained width, not the available space. Temporarily clearing and restoring has no visual impact because the browser doesn't paint during synchronous JS execution.

## usePretext Hook

Manages font readiness and provides memoized `prepare()`/`layout()` wrappers.

```tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { prepare, layout, type PreparedText } from '@chenglou/pretext'

type UsePretextResult = {
  isReady: boolean
  getPrepared: (text: string, font: string) => PreparedText
  getLayout: (prepared: PreparedText, maxWidth: number, lineHeight: number) => { lineCount: number; height: number }
}

export function usePretext(): UsePretextResult {
  const [isReady, setIsReady] = useState(false)
  const cacheRef = useRef(new Map<string, PreparedText>())

  useEffect(() => {
    document.fonts.ready.then(() => {
      setIsReady(true)
    })
  }, [])

  const getPrepared = useCallback(
    (text: string, font: string): PreparedText => {
      const key = `${font}::${text}`
      const cached = cacheRef.current.get(key)
      if (cached) return cached
      const prepared = prepare(text, font)
      cacheRef.current.set(key, prepared)
      return prepared
    },
    [],
  )

  const getLayout = useCallback(
    (prepared: PreparedText, maxWidth: number, lineHeight: number) => {
      return layout(prepared, maxWidth, lineHeight)
    },
    [],
  )

  return { isReady, getPrepared, getLayout }
}
```

**Cache key:** `font::text` ensures separate entries for the same text at different font sizes. The cache lives for the component's lifetime and is automatically garbage-collected on unmount.

## PretextProvider

Font readiness context wrapping the component tree.

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type PretextContextValue = {
  fontsReady: boolean
}

const PretextContext = createContext<PretextContextValue>({ fontsReady: false })

export function usePretextContext() {
  return useContext(PretextContext)
}

type PretextProviderProps = {
  children: ReactNode
}

export function PretextProvider({ children }: PretextProviderProps) {
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsReady(true)
    })
  }, [])

  return (
    <PretextContext.Provider value={{ fontsReady }}>
      {children}
    </PretextContext.Provider>
  )
}
```

**Placement:** Wrap at the layout root (e.g., in `app/layout.tsx`):

```tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <PretextProvider>
          <Navbar />
          {children}
          <Footer />
        </PretextProvider>
      </body>
    </html>
  )
}
```

## PretextBlock Component

Drop-in wrapper that provides height reservation and optional shrinkwrap.

```tsx
import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react'
import { prepare, layout, type PreparedText } from '@chenglou/pretext'
import { useContainerWidth } from './useContainerWidth'
import { usePretextContext } from './PretextProvider'

type PretextBlockProps = {
  text: string
  lineHeight: number       // unitless ratio matching CSS line-height (e.g., 1.65)
  shrinkwrap?: boolean     // enable orphan/widow prevention (only for left-aligned text!)
  as?: ElementType
  className?: string
  style?: CSSProperties
  children: ReactNode
}

function getFontFromStyles(styles: CSSStyleDeclaration): string {
  return styles.font.length > 0
    ? styles.font
    : `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily}`
}

export function PretextBlock({
  text,
  lineHeight,
  shrinkwrap = false,
  as: Tag = 'div',
  className,
  style,
  children,
}: PretextBlockProps) {
  const { fontsReady } = usePretextContext()
  const [refCallback, containerWidth] = useContainerWidth()
  const elRef = useRef<HTMLElement | null>(null)

  // Combined ref: feeds both useContainerWidth and our local elRef
  const combinedRef = (el: HTMLElement | null) => {
    elRef.current = el
    refCallback(el)
  }

  // Compute Pretext styles
  let pretextStyle: CSSProperties = {}

  if (fontsReady && containerWidth !== null && containerWidth > 0 && elRef.current) {
    // Read the actual computed font from the DOM element via ref
    // This handles next/font rewritten names (e.g., "__Unbounded_a1b2c3")
    const styles = getComputedStyle(elRef.current)
    const font = getFontFromStyles(styles)
    const lineHeightPx = parseFloat(styles.lineHeight) || lineHeight * parseFloat(styles.fontSize)

    const prepared = prepare(text, font)
    const result = layout(prepared, containerWidth, lineHeightPx)

    // Height reservation (always safe)
    pretextStyle.minHeight = `${result.height}px`

    // Shrinkwrap (only for left-aligned text)
    if (shrinkwrap) {
      const tightWidth = findTightWidth(prepared, containerWidth, lineHeightPx)
      pretextStyle.maxWidth = `${tightWidth}px`
    }
  }

  return (
    <Tag ref={combinedRef} className={className} style={{ ...style, ...pretextStyle }}>
      {children}
    </Tag>
  )
}

function findTightWidth(prepared: PreparedText, maxWidth: number, lineHeight: number): number {
  const initial = layout(prepared, maxWidth, lineHeight)
  let lo = 1, hi = Math.max(1, Math.ceil(maxWidth))
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (layout(prepared, mid, lineHeight).lineCount <= initial.lineCount) hi = mid
    else lo = mid + 1
  }
  return lo
}
```

**Important notes:**
- `PretextBlock` should ONLY set `min-height` and optionally `max-width`
- It should NEVER touch `grid`, `flex`, `display`, `padding`, `margin`, or `font` properties
- The `lineHeight` prop is a unitless ratio (e.g., `1.65`), converted to pixels internally
- Falls back to zero style adjustments if fonts aren't loaded (graceful degradation)

## Resize Coordinator

For apps with many PretextBlocks, use a single global resize coordinator to avoid redundant `window.resize` listeners:

```ts
type ResizeListener = () => void

const listeners = new Set<ResizeListener>()
let rafId: number | null = null

function onResize() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    for (const listener of listeners) {
      listener()
    }
  })
}

// Initialize once
if (typeof window !== 'undefined') {
  window.addEventListener('resize', onResize)
}

export function addResizeListener(fn: ResizeListener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}
```

Usage in `useContainerWidth`:
```ts
useEffect(() => {
  const cleanup = addResizeListener(scheduleMeasure)
  return cleanup
}, [scheduleMeasure])
```

## Usage Examples

### Left-aligned paragraph with orphan prevention

```tsx
<PretextBlock text={description} lineHeight={1.65} shrinkwrap as="p" className="text-base">
  {description}
</PretextBlock>
```

### Centered subtitle (height reservation only)

```tsx
<PretextBlock text={subtitle} lineHeight={1.6} as="p" className="text-center mx-auto text-lg">
  {subtitle}
</PretextBlock>
```

### Short title (height reservation only)

```tsx
<PretextBlock text={title} lineHeight={1.3} as="h3" className="text-2xl font-bold">
  {title}
</PretextBlock>
```

### Adding new text to a registry-based system

Some projects use a text registry for centralized management:

1. Add entry to `TEXT_REGISTRY` in `src/lib/pretext.ts`:
```ts
export const TEXT_REGISTRY = {
  'hero-body': { text: heroContent, fontType: 'body', lineHeightRatio: 1.65 },
  'about-intro': { text: aboutContent, fontType: 'body', lineHeightRatio: 1.6 },
  // add new entries here
} as const
```

2. Wrap the text element:
```tsx
<PretextBlock textId="hero-body" reserveHeight preventOrphans>
  {heroContent}
</PretextBlock>
```

## What NOT to Measure

Skip Pretext measurement for:

- **Short labels** and badges that never wrap to multiple lines
- **Elements with `letter-spacing`** — Pretext doesn't account for CSS tracking. Tailwind classes like `tracking-widest` or `tracking-[0.3em]` will produce inaccurate measurements
- **Text that never wraps** — fixed-width single-line labels, buttons, nav items
- **Elements with `system-ui` font** on macOS — use named fonts instead
- **Server-rendered content** where Canvas API is unavailable (server support planned)

## Testing Patterns

### Auto-mocking in jsdom environments

Canvas is unavailable in jsdom (common test environment). Auto-mock the Pretext module:

```ts
// src/test/setup.ts (or jest/vitest setup file)
vi.mock('@chenglou/pretext', () => ({
  prepare: vi.fn(() => ({})),
  layout: vi.fn(() => ({ lineCount: 1, height: 20 })),
  prepareWithSegments: vi.fn(() => ({ segments: [] })),
  layoutWithLines: vi.fn(() => ({ lineCount: 1, height: 20, lines: [] })),
  walkLineRanges: vi.fn(() => 1),
  layoutNextLine: vi.fn(() => null),
  clearCache: vi.fn(),
  setLocale: vi.fn(),
}))
```

### Testing PretextBlock behavior

```ts
// Mock document.fonts
Object.defineProperty(document, 'fonts', {
  value: {
    ready: Promise.resolve(),
    check: () => true,
  },
})

// Then test that PretextBlock renders children correctly
// and applies min-height when fontsReady=true
```

### Testing without Pretext mocks

For integration tests that need real Pretext behavior, ensure the test runner has canvas support (e.g., `jest-canvas-mock` or `@napi-rs/canvas` for Node.js).
