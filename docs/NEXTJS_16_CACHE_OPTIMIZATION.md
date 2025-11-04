# Next.js 16 Cache Optimization Strategy

## Overview

This document outlines the caching strategy for the CircleDay application using [Next.js 16's Cache Components](https://nextjs.org/docs/app/api-reference/directives/use-cache) feature.

## Current Status

**Cache Components: Disabled** ❌

The `cacheComponents` flag is currently disabled due to the project's client-heavy dashboard architecture. Most dashboard pages are client components that access personalized, runtime data (`useSession()`, dynamic user content), which is incompatible with Cache Components' pre-rendering requirements.

## Why Cache Components is Disabled

### Architectural Incompatibility

1. **Client-Heavy Architecture**: All dashboard pages (`/dashboard`, `/groups`, `/events`, etc.) are client components (`'use client'`)
2. **Runtime Dependencies**: Pages extensively use `useSession()`, `useRouter()`, and other runtime hooks
3. **Pre-rendering Conflicts**: Cache Components attempts to pre-render pages at build time, but client components with runtime data cause build errors:
   ```
   Error: Route "/events/[id]": Uncached data was accessed outside of <Suspense>
   ```

4. **Export Conflicts**: Using `export const dynamic = 'force-dynamic'` is incompatible with Cache Components:
   ```
   Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`
   ```

## Future Optimization Path

To enable Cache Components and leverage Next.js 16's caching benefits, consider this migration strategy:

### Phase 1: Hybrid Approach ✅ (Recommended for now)

Keep the current client-heavy architecture but optimize server actions:

```typescript
// lib/actions/groups.ts
export async function getGroups() {
  'use cache' // ← Works when cacheComponents is enabled
  const session = await auth.api.getSession({ headers: await headers() })
  // ... fetch and return data
}
```

**Benefits:**
- Server actions are automatically cached
- 15-minute default cache duration
- Automatic cache key generation based on function parameters
- Works seamlessly across client/server boundary

**To Enable:**
1. Uncomment `cacheComponents: true` in `next.config.ts`
2. Migrate dashboard to server components (Phase 2)

### Phase 2: Server Component Migration (Future)

Refactor dashboard pages to server components for full cache benefits:

#### Before (Client Component):
```typescript
'use client'

export default function GroupsPage() {
  const { data: session } = useSession()
  const [groups, setGroups] = useState([])
  
  useEffect(() => {
    loadGroups()
  }, [])
  
  // ...
}
```

#### After (Server Component with Cache):
```typescript
// No 'use client' directive

export default async function GroupsPage() {
  'use cache' // ← Cache entire page
  
  const session = await auth.api.getSession({ headers: await headers() })
  const groups = await getGroups()
  
  return (
    <div>
      {/* Render directly */}
      {groups.map(group => <GroupCard key={group.id} group={group} />)}
    </div>
  )
}
```

**Benefits:**
- Entire page cached at build time or on first request
- Instant page loads for subsequent users
- Reduced database queries
- Better SEO (server-rendered content)

### Phase 3: Advanced Caching with Revalidation

Use `cacheLife` and `cacheTag` for fine-grained control:

```typescript
import { cacheTag, cacheLife } from 'next/cache'

export async function getGroups() {
  'use cache'
  cacheTag('groups') // Tag for targeted invalidation
  cacheLife('hours') // Cache for 1 hour instead of default 15 min
  
  // ... fetch data
}

// In mutations:
export async function createGroup(data) {
  'use server'
  // ... create group
  revalidateTag('groups') // Invalidate all cached content tagged with 'groups'
}
```

## Cache Configuration

### Default Behavior (Cache Components Enabled)

```typescript
// next.config.ts
const config: NextConfig = {
  cacheComponents: true, // Enable Cache Components
  
  // Optional: Custom cache life profiles
  cacheLife: {
    short: { stale: 60, revalidate: 300 },        // 1min stale, 5min revalidate
    default: { stale: 900, revalidate: 3600 },    // 15min stale, 1h revalidate  
    long: { stale: 3600, revalidate: 86400 },     // 1h stale, 24h revalidate
  },
}
```

### Using Cache Life Profiles

```typescript
export async function getStaticContent() {
  'use cache'
  cacheLife('long') // Use 'long' profile: 1 hour stale, 24 hour revalidate
  
  return await fetch('/api/static-content')
}
```

## References

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
- [`use cache` Directive Documentation](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [`cacheLife` API](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [`cacheTag` API](https://nextjs.org/docs/app/api-reference/functions/cacheTag)

## Migration Checklist

When ready to enable Cache Components:

- [ ] Migrate dashboard pages from client to server components
- [ ] Replace `useSession()` with server-side `auth.api.getSession()`
- [ ] Replace `useState`/`useEffect` patterns with direct server data fetching
- [ ] Add `'use cache'` to frequently-accessed read-only functions
- [ ] Add `cacheTag()` to functions that need targeted invalidation
- [ ] Add `revalidateTag()` to mutation functions
- [ ] Enable `cacheComponents: true` in `next.config.ts`
- [ ] Test build and runtime behavior
- [ ] Monitor cache hit rates and adjust `cacheLife` profiles

## Performance Impact

**Expected improvements with Cache Components enabled:**

- **Server Actions**: 15-minute default cache → Reduced database queries
- **Page Renders**: Pre-rendered pages → Instant page loads
- **API Load**: Reduced load on database and authentication services
- **User Experience**: Faster navigation, instant page transitions

**Trade-offs:**

- Slightly stale data (default 15 minutes)
- More complex invalidation logic
- Requires server component architecture

