# Setup Guide

## Table of Contents
- Installation
- Why Special Setup Is Needed
- Next.js Setup
- Vite Setup
- Bun / Vanilla Setup
- Verifying the Setup
- Latest Reference

## Installation

```bash
npm install @chenglou/pretext
# or
pnpm add @chenglou/pretext
# or
yarn add @chenglou/pretext
# or
bun add @chenglou/pretext
```

Peer dependency: TypeScript 5+

## Why Special Setup Is Needed

Pretext ships **raw TypeScript source files** with `.ts` extension imports — not compiled JavaScript. This is intentional (allows better tree-shaking and type inference), but requires bundler configuration:

1. The bundler must know to transpile `.ts` files from `node_modules/@chenglou/pretext`
2. TypeScript must allow imports with `.ts` extensions (pretext's internal imports use `./bidi.ts`, `./analysis.ts`, etc.)

Without these changes:
- Next.js/Turbopack fails with "Unknown module type"
- TypeScript fails with "An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled"
- Note: `skipLibCheck: true` does NOT help because pretext ships `.ts` files, not `.d.ts` files

## Next.js Setup

### 1. next.config.js / next.config.ts

Add `transpilePackages`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@chenglou/pretext'],
  // ... rest of config
}

module.exports = nextConfig
```

Or in TypeScript:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@chenglou/pretext'],
}

export default nextConfig
```

### 2. tsconfig.json

Add `allowImportingTsExtensions` (Next.js already sets `noEmit: true` which is required):

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true
  }
}
```

### 3. Import

```ts
import { prepare, layout } from '@chenglou/pretext'
```

## Vite Setup

### 1. vite.config.ts

Add `optimizeDeps.include` so Vite pre-bundles the raw `.ts` source:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@chenglou/pretext'],
  },
})
```

### 2. tsconfig.json

Add `allowImportingTsExtensions` (Vite projects typically already have `noEmit: true`):

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

### 3. Import

```ts
import { prepare, layout } from '@chenglou/pretext'
```

## Bun / Vanilla Setup

Bun natively handles `.ts` imports, so no extra configuration is needed:

```bash
bun add @chenglou/pretext
```

```ts
import { prepare, layout } from '@chenglou/pretext'
```

For the Pretext repo's own dev server:
```bash
bun install
bun start  # http://localhost:3000
```

## Verifying the Setup

Quick test — add this to any client component or script:

```ts
import { prepare, layout } from '@chenglou/pretext'

await document.fonts.ready
const prepared = prepare('Hello world', '16px sans-serif')
const result = layout(prepared, 200, 20)
console.log('Pretext working:', result) // { lineCount: 1, height: 20 }
```

**Troubleshooting:**
- **Import fails / "Unknown module type"**: Check `transpilePackages` (Next.js) or `optimizeDeps.include` (Vite)
- **TypeScript error on .ts extension**: Check `allowImportingTsExtensions: true` in tsconfig.json
- **Measurements are wrong**: Ensure fonts are loaded (`document.fonts.ready`) and font string matches computed CSS
- **NaN or zero height**: Check that `maxWidth` and `lineHeight` are positive numbers, not strings

## Latest Reference

For the most current setup instructions, check:
- **README:** https://github.com/chenglou/pretext#installation
- **DEVELOPMENT.md:** https://github.com/chenglou/pretext/blob/main/DEVELOPMENT.md
- **npm:** https://www.npmjs.com/package/@chenglou/pretext
