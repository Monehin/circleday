# Epic 1.5: Brand & Design System

**Priority:** P0 (Critical - blocks Epic 2)  
**Rationale:** Features must be built with exceptional UX from day one

---

## Overview

Transform CircleDay from functional to exceptional with:
- Complete semantic color system
- Thoughtful micro-interactions
- Mobile-first, polished components
- Accessibility-first approach
- Consistent, delightful experience

---

## Brand Guidelines

### Theme
- **Name:** CircleDay
- **Vibe:** Thoughtful, celebratory, trustworthy
- **Voice:** Warm, concise, action-oriented
- **Emoji Rule:** One max per line

### Color Strategy

**Semantic Tokens (not hardcoded colors):**
```typescript
colors: {
  primary: 'Soft coral' (#FF7A39 base)
  accent: 'Citrus' (#F59E0B base)
  success: 'Green'
  warning: 'Amber'
  danger: 'Red'
  surface: 'White/depth-50'
  'surface-elevated': 'White with shadow'
  text: 'depth-900'
  muted: 'depth-500'
  ring: 'primary with opacity'
  border: 'depth-200'
}
```

**Requirements:**
- Light & dark variants
- AA contrast minimum
- Cool-gray neutrals (depth scale)

### Typography
- **Font:** Friendly geometric sans (Inter or Plus Jakarta Sans)
- **Hierarchy:** Clear, scannable
- **Line height:** Generous for readability

### Spacing & Shape
- **Rounded corners:** lg-2xl (12px-24px)
- **Shadows:** Soft, multi-layer
- **Borders:** Hairline (1px), subtle
- **Spacing:** Consistent 4px grid

---

## Motion Philosophy

### Timing
- **Micro-interactions:** 120-200ms (quick, responsive)
- **Transitions:** 200-300ms (smooth)
- **Animations:** Purpose-driven, never gratuitous

### Signature Moments
- ✨ Subtle confetti on "Send a coffee"
- 🎉 Confetti on 100% group pot
- ⏱️ Gentle countdown for expiring links
- 📊 Animated progress bars

### Settings
- **Calm Mode:** Minimal motion
- **Playful Mode:** Default, slightly larger amplitudes
- **Reduced Motion:** Respect `prefers-reduced-motion`

---

## User Stories

### US-1.5.1: Semantic Color System

**As a** designer/developer  
**I want** semantic color tokens instead of hardcoded values  
**So that** theming is consistent and dark mode works perfectly

**Acceptance Criteria:**
- [ ] Semantic tokens defined (primary, accent, success, warning, danger)
- [ ] Surface hierarchy (surface, surface-elevated)
- [ ] Text hierarchy (text, muted, heading)
- [ ] Interactive states (ring, border, hover)
- [ ] Light mode: AA contrast
- [ ] Dark mode: AA contrast
- [ ] All components use semantic tokens

**Tasks:**
- Define semantic color system in Tailwind config
- Create CSS variables for light/dark modes
- Update existing components to use semantic colors
- Test contrast ratios
- Document color usage

---

### US-1.5.2: Typography System

**As a** user  
**I want** clear, readable typography  
**So that** I can easily scan and understand content

**Acceptance Criteria:**
- [ ] Inter or Plus Jakarta Sans installed
- [ ] Clear type scale (display, h1-h4, body, small, xs)
- [ ] Line heights optimized for readability
- [ ] Font weights used meaningfully (regular, medium, semibold, bold)
- [ ] Responsive sizes (larger on mobile for readability)

**Tasks:**
- Install font family (next/font)
- Define type scale
- Create typography utilities
- Update all text to use scale

---

### US-1.5.3: Motion & Animation System

**As a** user  
**I want** delightful micro-interactions  
**So that** the app feels responsive and alive

**Acceptance Criteria:**
- [ ] Framer Motion integrated
- [ ] Button hover/press states (120-200ms)
- [ ] Card hover lift effect
- [ ] Page transitions smooth
- [ ] Loading states animated
- [ ] Success/error feedback animated
- [ ] Reduced motion fallbacks
- [ ] Calm/Playful mode setting

**Tasks:**
- Install Framer Motion
- Create animation variants library
- Add hover states to all interactive elements
- Create page transition wrapper
- Implement loading skeletons
- Add success/error animations
- Respect prefers-reduced-motion
- Create motion preference setting

---

### US-1.5.4: Component Polish

**As a** user  
**I want** polished, state-rich components  
**So that** every interaction feels intentional

**Acceptance Criteria:**
- [ ] All states: default, hover, focus, pressed, loading, disabled, invalid, success
- [ ] Focus rings visible and beautiful
- [ ] Loading spinners consistent
- [ ] Disabled states clear
- [ ] Error states helpful
- [ ] Success states celebratory

**Components to Polish:**
- Button, Input, Select, Textarea
- Checkbox, Radio, Switch
- Card (with hover lift)
- Badge, Avatar
- Toast (Sonner with custom styling)
- Dialog/Sheet
- Tabs, Progress
- EmptyState, Skeleton

**Tasks:**
- Add all interaction states
- Implement focus-visible rings
- Create loading variants
- Style disabled states
- Design error/success feedback
- Add micro-animations

---

### US-1.5.5: Key Screen Designs

**As a** user  
**I want** intuitive, beautiful screens  
**So that** I can accomplish tasks effortlessly

**Mobile-First Screens:**
1. Group dashboard
2. Invite/open-link page
3. Member self-serve form
4. Wish Wall
5. Gifting page
6. Group Pot
7. Admin status

**Acceptance Criteria:**
- [ ] Mobile-first responsive
- [ ] 44px minimum touch targets
- [ ] Clear visual hierarchy
- [ ] Intuitive navigation
- [ ] Empty states delightful
- [ ] Loading states smooth
- [ ] Error states helpful

---

### US-1.5.6: Accessibility Foundation

**As a** user with accessibility needs  
**I want** keyboard navigation and screen reader support  
**So that** I can use CircleDay independently

**Acceptance Criteria:**
- [ ] Keyboard-only flows work
- [ ] ARIA labels on all interactive elements
- [ ] Logical focus order
- [ ] 44px minimum touch targets
- [ ] AA contrast (light & dark)
- [ ] Focus rings visible
- [ ] Screen reader tested

**Tasks:**
- Add ARIA labels
- Test keyboard navigation
- Verify focus order
- Test with VoiceOver/NVDA
- Check contrast ratios
- Ensure touch targets 44px+

---

## Implementation Priority

**Phase 1: Core System** (4-6 hours)
1. US-1.5.1: Semantic Color System
2. US-1.5.2: Typography System
3. US-1.5.3: Motion & Animation System

**Phase 2: Component Polish** (3-4 hours)
4. US-1.5.4: Component States & Polish

**Phase 3: Screens** (Ongoing with features)
5. US-1.5.5: Key Screen Designs (as we build them)
6. US-1.5.6: Accessibility (continuous)

---

## Design Tokens

```typescript
// tailwind.config.ts
const colors = {
  // Semantic tokens
  primary: {
    DEFAULT: '#FF7A39', // celebration-500
    50: '#FFF5F2',
    100: '#FFE8E0',
    // ... full scale
    foreground: '#FFFFFF',
  },
  accent: {
    DEFAULT: '#F59E0B', // warmth-500
    50: '#FFFBEB',
    // ... full scale
    foreground: '#FFFFFF',
  },
  success: {
    DEFAULT: '#10B981',
    foreground: '#FFFFFF',
  },
  warning: {
    DEFAULT: '#F59E0B',
    foreground: '#FFFFFF',
  },
  danger: {
    DEFAULT: '#EF4444',
    foreground: '#FFFFFF',
  },
  surface: {
    DEFAULT: '#FFFFFF',
    elevated: '#FFFFFF',
    foreground: '#0F172A',
  },
  muted: {
    DEFAULT: '#64748B',
    foreground: '#64748B',
  },
  ring: 'hsl(var(--ring))',
  border: '#E2E8F0',
}
```

---

## Animation Variants

```typescript
// lib/animations/variants.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

export const cardHover = {
  hover: { 
    y: -4,
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    transition: { type: 'spring', stiffness: 400 }
  }
}

export const buttonPress = {
  tap: { scale: 0.98 },
  transition: { duration: 0.15 }
}
```

---

## Component Examples

### Button with Motion
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="..."
>
  Click me
</motion.button>
```

### Card with Hover Lift
```tsx
<motion.div
  whileHover="hover"
  variants={cardHover}
  className="..."
>
  Card content
</motion.div>
```

---

## Next Steps

1. Implement semantic color system
2. Set up typography with Inter/Plus Jakarta Sans
3. Integrate Framer Motion
4. Polish existing components
5. Create animation library
6. Then continue Epic 2 with beautiful auth pages

**Estimated Time:** 8-10 hours for core system
**Impact:** All future features will be beautiful by default

