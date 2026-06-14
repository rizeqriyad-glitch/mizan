---
name: pen-ultra
description: >
  Legendary full-stack design system for PEN (قلم) and ANY website — build from scratch or redesign.
  Compressed graphify-style architecture - tiny always-on router (SKILL.md) + 13 on-demand sections.
  Covers Motion/Framer animation, Remotion video, Three.js/Spline 3D heroes, interactive logo reveals,
  Arabic+English typography vault, brand identity, product DNA, advertising creative, UI/UX pro standards,
  zero-bug quality gates. Use for any frontend design, animation, 3D, branding, logo, video, ad, or UI review task.
  ALWAYS trigger this skill when user says: "build a website", "design a page", "make a logo", "add animation",
  "3D hero", "create component", "build UI", "fix design", "make it look good", "glassmorphism", "dark mode",
  "motion graphics", "logo reveal", "kinetic typography", "brand", "color palette", "typography", "PEN", "قلم".
---

# 🖊️ PEN ULTRA — Master Website Design Skill
> One skill to rule all website creation, design, animation, and branding tasks.
> Arabic + English | Dark + Light | 3D + Motion | Zero Bugs | Production Grade

---

## ⚡ QUICK START — READ THIS FIRST

When activated, immediately:
1. **Detect project context** (framework, styles, existing components)
2. **Ask the 4 Golden Questions** if not already answered in conversation
3. **Load the relevant sections** below based on the task
4. **Execute with zero bugs and maximum beauty**

---

## 📐 SKILL ARCHITECTURE

This is a **single-file skill** with self-contained sections. Jump to the section you need:

| Section | Topic |
|---------|-------|
| [§1 Golden Questions](#s1) | Project setup choices |
| [§2 Tech Stack](#s2) | Dependencies & tools |
| [§3 Project Setup](#s3) | Init commands, config files |
| [§4 Design System](#s4) | Color palettes, tokens |
| [§5 Typography](#s5) | Arabic + English fonts |
| [§6 Animation](#s6) | Framer Motion + GSAP |
| [§7 Three.js & 3D](#s7) | R3F, shaders, particles |
| [§8 Logo Reveal](#s8) | 4 animation techniques |
| [§9 Dark/Light Mode](#s9) | Theme system |
| [§10 Arabic & RTL](#s10) | Bidi, RTL layout |
| [§11 Component Library](#s11) | Buttons, cards, nav |
| [§12 Branding](#s12) | Identity, gradients |
| [§13 Quality Gates](#s13) | Zero-bug checklist |
| [§14 Execution Workflow](#s14) | Step-by-step process |
| [§15 MCP Integrations](#s15) | External tools |

---

<a name="s1"></a>
## 🎯 §1 — THE 4 GOLDEN QUESTIONS

Ask these ONCE per project. Skip if already answered in conversation:

```
Q1: COLOR PALETTE
Which palette for this website?
  [1] Electric Purple  — #4000ff  (dramatic, futuristic)
  [2] Digital Blue     — #0066ff  (clean, tech, trustworthy)
  [3] Prussian Blue    — #5563aa  (calm, editorial, refined)
  [4] Jet Black        — #677098  (minimal, sophisticated)
  [5] Crimson Carrot   — #fb4604  (bold, energetic, warm)
  [6] Forest Fern      — #689867  (natural, fresh, organic)
  [X] Custom mix       — describe what you want

Q2: TYPOGRAPHY STYLE
Choose your font pairing:
  [A] Classic Luxury   → Rakkas (AR) + Noto Serif (EN)
  [B] Editorial Bold   → Al-Jazeera Bold (AR) + Merriweather (EN)
  [C] Modern Clean     → Palestine Regular (AR) + Noto Serif (EN)
  [D] Dramatic Weight  → Al-Jazeera Bold (AR) + Merriweather Bold (EN)

Q3: LOGO REVEAL STYLE
Pick animation technique:
  [1] Trim Paths    — SVG stroke draws itself (elegant)
  [2] Shape Morph   — Geometry transforms into logo (magical)
  [3] 3D Spin       — Logo spins in 3D then lands (epic)
  [4] Kinetic Type  — Each letter animates independently (dynamic)
  [★] Signature Mix — Trim Paths + Kinetic Type (RECOMMENDED)

Q4: COLOR MODE
  [D] Dark Mode only
  [L] Light Mode only
  [B] Both with toggle switch
```

---

<a name="s2"></a>
## 🛠️ §2 — TECH STACK (Production Standard)

```yaml
Framework:    Next.js 14+ (App Router)
Language:     TypeScript (strict mode, no any)
Styling:      Tailwind CSS + CSS custom properties
Animation:    Framer Motion + GSAP (ScrollTrigger, DrawSVG, SplitText)
3D:           Three.js + @react-three/fiber + @react-three/drei
PostFX:       @react-three/postprocessing
Video:        Remotion (motion graphics, programmatic video)
Icons:        Lucide React + custom SVG
Fonts_AR:     Rakkas, Palestine, Al-Jazeera (local TTF/OTF)
Fonts_EN:     Noto Serif, Merriweather (Google Fonts via next/font)
State:        Zustand (global) + TanStack Query (server state)
Variants:     class-variance-authority (CVA)
Utils:        clsx + tailwind-merge
Quality:      ESLint + Prettier + Lighthouse CI
```

---

<a name="s3"></a>
## 🚀 §3 — PROJECT SETUP

### New Next.js Project Bootstrap

```bash
# 1. Create project
npx create-next-app@latest my-website \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*"

cd my-website

# 2. Core dependencies
npm install framer-motion gsap @gsap/react
npm install three @react-three/fiber @react-three/drei @types/three
npm install @react-three/postprocessing postprocessing
npm install zustand @tanstack/react-query
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react maath

# 3. Dev tools
npm install -D @types/node prettier eslint-config-prettier
```

### Arabic Fonts Setup

```bash
# Copy Arabic fonts to public/fonts/
mkdir -p public/fonts
# Place these files in public/fonts/:
# - Rakkas-Regular.ttf
# - Palestine-Regular.otf
# - AL-JAZEERA-ARABIC-BOLD.TTF
# - AL-JAZEERA-ARABIC-REGULAR.TTF
# - AL-JAZEERA-ARABIC-LIGHT.TTF
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rakkas:    ['Rakkas', 'serif'],
        palestine: ['Palestine', 'sans-serif'],
        aljazeera: ['AlJazeera', 'sans-serif'],
        serif:     ['var(--font-noto-serif)', 'Noto Serif', 'serif'],
        merri:     ['var(--font-merriweather)', 'Merriweather', 'serif'],
      },
      colors: {
        primary: {
          50:  'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)',
        },
        bg: {
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated:  'var(--bg-elevated)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease-out forwards',
        'slide-up':   'slideUp 0.6s ease-out forwards',
        'draw':       'draw 2s ease-in-out forwards',
        'float':      'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        draw:      { '0%': { strokeDashoffset: '1000' }, '100%': { strokeDashoffset: '0' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;
```

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { optimizeCss: true },
  images: { formats: ['image/avif', 'image/webp'] },
  compress: true,
};

export default config;
```

### GSAP Setup

```typescript
// lib/gsap.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

export { gsap, ScrollTrigger };
```

### MCP Setup (.mcp.json)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@chrome-devtools/mcp-server"]
    },
    "higgsfield": {
      "url": "https://higgsfield.ai/mcp",
      "type": "sse"
    },
    "blender": {
      "command": "python",
      "args": ["-m", "blender_mcp_server"]
    }
  }
}
```

---

<a name="s4"></a>
## 🎨 §4 — DESIGN SYSTEM & COLOR PALETTES

### How to Use
1. User picks a palette (Q1)
2. Copy the CSS block into `:root` in `globals.css`
3. All components reference `var(--primary-*)` — never hardcode hex

### Palette 1 — Electric Purple
```css
:root {
  --primary-50:  #ece5ff;
  --primary-100: #d9ccff;
  --primary-200: #b399ff;
  --primary-300: #8c66ff;
  --primary-400: #6633ff;
  --primary-500: #4000ff;
  --primary-600: #3300cc;
  --primary-700: #260099;
  --primary-800: #1a0066;
  --primary-900: #0d0033;
  --primary-950: #090024;
  --primary-rgb: 64, 0, 255;
}
```

### Palette 2 — Digital Blue
```css
:root {
  --primary-50:  #e5f0ff;
  --primary-100: #cce0ff;
  --primary-200: #99c2ff;
  --primary-300: #66a3ff;
  --primary-400: #3385ff;
  --primary-500: #0066ff;
  --primary-600: #0052cc;
  --primary-700: #003d99;
  --primary-800: #002966;
  --primary-900: #001433;
  --primary-950: #000e24;
  --primary-rgb: 0, 102, 255;
}
```

### Palette 3 — Prussian Blue
```css
:root {
  --primary-50:  #eeeff6;
  --primary-100: #dde0ee;
  --primary-200: #bbc1dd;
  --primary-300: #99a2cc;
  --primary-400: #7783bb;
  --primary-500: #5563aa;
  --primary-600: #445088;
  --primary-700: #333c66;
  --primary-800: #222844;
  --primary-900: #111422;
  --primary-950: #0c0e18;
  --primary-rgb: 85, 99, 170;
}
```

### Palette 4 — Jet Black
```css
:root {
  --primary-50:  #f0f1f5;
  --primary-100: #e1e2ea;
  --primary-200: #c2c6d6;
  --primary-300: #a4a9c1;
  --primary-400: #868dac;
  --primary-500: #677098;
  --primary-600: #535a79;
  --primary-700: #3e435b;
  --primary-800: #292d3d;
  --primary-900: #15161e;
  --primary-950: #0e1015;
  --primary-rgb: 103, 112, 152;
}
```

### Palette 5 — Crimson Carrot
```css
:root {
  --primary-50:  #ffece6;
  --primary-100: #fedacd;
  --primary-200: #fdb59b;
  --primary-300: #fd9068;
  --primary-400: #fc6b36;
  --primary-500: #fb4604;
  --primary-600: #c93803;
  --primary-700: #972a02;
  --primary-800: #641c02;
  --primary-900: #320e01;
  --primary-950: #230a01;
  --primary-rgb: 251, 70, 4;
}
```

### Palette 6 — Forest Fern
```css
:root {
  --primary-50:  #f0f5f0;
  --primary-100: #e1eae1;
  --primary-200: #c3d6c2;
  --primary-300: #a4c1a4;
  --primary-400: #86ac86;
  --primary-500: #689867;
  --primary-600: #537953;
  --primary-700: #3e5b3e;
  --primary-800: #2a3d29;
  --primary-900: #151e15;
  --primary-950: #0f150e;
  --primary-rgb: 104, 152, 103;
}
```

### Semantic Tokens (add after palette)
```css
:root {
  /* Actions */
  --color-action:        var(--primary-500);
  --color-action-hover:  var(--primary-400);
  --color-action-active: var(--primary-600);
  --color-action-text:   #ffffff;

  /* Gradients */
  --gradient-primary:  linear-gradient(135deg, var(--primary-400), var(--primary-700));
  --gradient-text:     linear-gradient(135deg, var(--primary-300), var(--primary-500));
  --gradient-hero:     radial-gradient(ellipse at 50% 0%, var(--primary-900) 0%, #000 60%);
  --gradient-glow:     radial-gradient(ellipse at 50% 50%, var(--primary-500) 0%, transparent 70%);

  /* Status */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
  --color-info:    #3b82f6;
}
```

---

<a name="s5"></a>
## 🔤 §5 — TYPOGRAPHY SYSTEM

### Arabic @font-face Declarations (globals.css)
```css
/* Rakkas — Decorative, Display, Hero Headlines */
@font-face {
  font-family: 'Rakkas';
  src: url('/fonts/Rakkas-Regular.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+0600-06FF, U+200C-200E, U+FB50-FDFF, U+FE80-FEFC;
}

/* Palestine — Clean, Body, UI Elements */
@font-face {
  font-family: 'Palestine';
  src: url('/fonts/Palestine-Regular.otf') format('opentype');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+0600-06FF;
}

/* Al-Jazeera — Editorial, News, Headings */
@font-face {
  font-family: 'AlJazeera';
  src: url('/fonts/AL-JAZEERA-ARABIC-BOLD.TTF') format('truetype');
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: 'AlJazeera';
  src: url('/fonts/AL-JAZEERA-ARABIC-REGULAR.TTF') format('truetype');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'AlJazeera';
  src: url('/fonts/AL-JAZEERA-ARABIC-LIGHT.TTF') format('truetype');
  font-weight: 300;
  font-display: swap;
}
```

### English Fonts (app/layout.tsx)
```typescript
import { Noto_Serif, Merriweather } from 'next/font/google';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning
      className={`${notoSerif.variable} ${merriweather.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Pairing Rules

```
PAIR A — Classic Luxury:
  Hero AR:   font-family: 'Rakkas', serif;        font-weight: 400;
  Hero EN:   font-family: var(--font-noto-serif); font-weight: 700;
  Body AR:   font-family: 'Palestine', sans-serif; font-weight: 400;
  Body EN:   font-family: var(--font-noto-serif); font-weight: 400;

PAIR B — Editorial Bold:
  Hero AR:   font-family: 'AlJazeera', sans-serif; font-weight: 700;
  Hero EN:   font-family: var(--font-merriweather); font-weight: 900;
  Body AR:   font-family: 'AlJazeera', sans-serif; font-weight: 400;
  Body EN:   font-family: var(--font-merriweather); font-weight: 400;
  UI AR:     font-family: 'AlJazeera', sans-serif; font-weight: 300;

PAIR C — Modern Clean:
  All AR:    font-family: 'Palestine', sans-serif;
  All EN:    font-family: var(--font-noto-serif);

PAIR D — Dramatic Weight:
  Headings AR: 'AlJazeera' 700 + Headings EN: var(--font-merriweather) 900;
  Body AR:     'AlJazeera' 400 + Body EN:     var(--font-merriweather) 400;
```

### Type Scale (CSS)
```css
:root {
  --text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 0.8rem  + 0.375vw, 1rem);
  --text-base: clamp(1rem,     0.9rem  + 0.5vw,   1.125rem);
  --text-lg:   clamp(1.125rem, 1rem    + 0.625vw, 1.25rem);
  --text-xl:   clamp(1.25rem,  1.1rem  + 0.75vw,  1.5rem);
  --text-2xl:  clamp(1.5rem,   1.3rem  + 1vw,     2rem);
  --text-3xl:  clamp(1.875rem, 1.5rem  + 1.875vw, 2.5rem);
  --text-4xl:  clamp(2.25rem,  1.75rem + 2.5vw,   3.5rem);
  --text-5xl:  clamp(3rem,     2rem    + 5vw,      5rem);
  --text-hero: clamp(3.5rem,   2rem    + 7.5vw,    7rem);
}

.arabic-body    { line-height: 1.9; letter-spacing: 0; word-spacing: 0.05em; }
.arabic-heading { line-height: 1.4; font-feature-settings: "calt" 1, "liga" 1; }
```

---

<a name="s6"></a>
## ✨ §6 — ANIMATION SYSTEM

### Core Easing & Duration Constants
```typescript
// lib/animations.ts
export const EASE = {
  smooth:    [0.25, 0.46, 0.45, 0.94] as const,
  snappy:    [0.175, 0.885, 0.32, 1.275] as const,
  cinematic: [0.87, 0, 0.13, 1] as const,
  spring:    { type: 'spring', stiffness: 300, damping: 30 },
  enter:     [0.0, 0.0, 0.2, 1.0] as const,
  exit:      [0.4, 0.0, 1.0, 1.0] as const,
  overshoot: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const DUR = {
  instant:   0.1,
  fast:      0.2,
  normal:    0.4,
  slow:      0.7,
  cinematic: 1.2,
  logo:      2.0,
} as const;
```

### Reveal on Scroll (Framer Motion)
```typescript
'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { EASE } from '@/lib/animations';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export function Reveal({ children, delay = 0, direction = 'up', className }: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const offsets = {
    up:    { y: 40 }, down:  { y: -40 },
    left:  { x: 40 }, right: { x: -40 },
    none:  {},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, filter: 'blur(6px)', ...offsets[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, delay, ease: EASE.cinematic }}
    >
      {children}
    </motion.div>
  );
}
```

### Stagger List
```typescript
'use client';
import { motion } from 'framer-motion';

export function StaggerList({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
    >
      {items.map((child, i) => (
        <motion.li key={i} variants={{
          hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5 } }
        }}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Magnetic Button
```typescript
'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

export function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  function onMouseMove(e: React.MouseEvent) {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
```

### GSAP Scroll — Parallax Hero
```typescript
'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function useParallax(strength = 100) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -strength,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });
    });
    return () => ctx.revert();
  }, [strength]);

  return ref;
}
```

### GSAP Scroll — Text Split Reveal
```typescript
'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function SplitReveal({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.innerText.split('').map(ch => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.display = 'inline-block';
      return span;
    });
    el.innerHTML = '';
    chars.forEach(s => el.appendChild(s));

    const ctx = gsap.context(() => {
      gsap.from(chars, {
        opacity: 0, y: 50, rotateX: -80,
        stagger: 0.025, duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });
    return () => ctx.revert();
  }, []);

  return <h2 ref={ref} className={className}>{children}</h2>;
}
```

### Page Transition (App Router)
```typescript
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Reduced Motion — ALWAYS Include
```css
/* globals.css — top of file */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

<a name="s7"></a>
## 🌐 §7 — THREE.JS & REACT THREE FIBER

### Standard Scene Wrapper
```typescript
// components/three/Scene.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { Environment, Preload, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { Suspense, useState } from 'react';

interface SceneProps {
  children: React.ReactNode;
  className?: string;
  env?: string;
  controls?: boolean;
}

export function Scene({ children, className, env = 'city' }: SceneProps) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <div className={`w-full h-full ${className ?? ''}`}>
      <Canvas
        dpr={[1, dpr]}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
        gl={{
          antialias: true, alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 4,   // ACESFilmic
          toneMappingExposure: 1.0,
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.5)}
        />
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <Environment preset={env as any} />
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### Floating Orb with Custom Shader
```typescript
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export function FloatingOrb({ color = '#4000ff', radius = 1.2 }: { color?: string; radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color(color) },
  }), [color]);

  useFrame(({ clock }) => { uniforms.uTime.value = clock.elapsedTime; });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[radius, 5]} />
        <shaderMaterial
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          vertexShader={`
            uniform float uTime;
            varying vec3 vNormal;
            void main() {
              vNormal = normal;
              vec3 pos = position;
              pos.x += sin(pos.y * 3.0 + uTime * 1.5) * 0.05;
              pos.y += cos(pos.x * 3.0 + uTime * 1.2) * 0.05;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uColor;
            varying vec3 vNormal;
            void main() {
              float diff = max(dot(vNormal, normalize(vec3(1.0, 2.0, 3.0))), 0.0);
              gl_FragColor = vec4(uColor * (diff + 0.3), 0.85);
            }
          `}
        />
      </mesh>
    </Float>
  );
}
```

### Glass Text 3D
```typescript
import { Text3D, Center, MeshTransmissionMaterial } from '@react-three/drei';

export function GlassText({ text, fontSize = 1 }: { text: string; fontSize?: number }) {
  return (
    <Center>
      <Text3D font="/fonts/Noto_Serif_Regular.json" size={fontSize}
        height={0.15} bevelEnabled bevelSize={0.02} bevelThickness={0.04}>
        {text}
        <MeshTransmissionMaterial
          backside backsideThickness={0.3}
          samples={16} resolution={512}
          transmission={1} roughness={0} thickness={0.3}
          ior={1.5} chromaticAberration={0.06}
          distortion={0.1} distortionScale={0.3}
        />
      </Text3D>
    </Center>
  );
}
```

### Star Field Particles
```typescript
import { Points, PointMaterial } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StarField({ count = 3000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 30;
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 18;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#8888ff" size={0.012} sizeAttenuation depthWrite={false} />
    </Points>
  );
}
```

### Post-Processing Effects
```typescript
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export function PostFX() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.6} intensity={0.8} mipmapBlur />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.001, 0.001)}
      />
      <Vignette offset={0.3} darkness={0.8} />
    </EffectComposer>
  );
}
```

### Memory Cleanup (CRITICAL)
```typescript
// Always dispose in useEffect cleanup
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    scene.clear();
  };
}, []);
```

---

<a name="s8"></a>
## 🎬 §8 — LOGO REVEAL SYSTEM (4 Techniques)

### Technique 1 — Trim Paths (SVG Draw)
```typescript
'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function LogoRevealTrimPaths({ delay = 0.5 }: { delay?: number }) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  const paths = [
    "M20 80 L20 20 L50 20 Q70 20 70 40 Q70 60 50 60 L20 60",
    "M90 20 L90 80 M90 50 L120 20 M90 50 L120 80",
    "M140 20 L140 80 M140 20 L170 80 M170 20 L170 80",
  ];

  return (
    <svg viewBox="0 0 200 100" className="w-48 h-24" aria-label="Logo">
      {paths.map((d, i) => (
        <motion.path key={i} d={d}
          stroke="var(--primary-500)" strokeWidth={3} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={started ? { pathLength: 1, opacity: 1 } : {}}
          transition={{
            pathLength: { duration: 1.5, delay: i * 0.3, ease: "easeInOut" },
            opacity:    { duration: 0.2, delay: i * 0.3 },
          }}
        />
      ))}
      {paths.map((d, i) => (
        <motion.path key={`f${i}`} d={d} fill="var(--primary-500)" stroke="none"
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.5 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}
```

### Technique 2 — Shape Morphing
```typescript
'use client';
import { motion } from 'framer-motion';

const MORPH_STEPS = [
  "M100 20 L180 100 L20 100 Z",
  "M20 20 L180 20 L180 100 L20 100 Z",
  "M100 10 C155 10 190 45 190 90 C190 135 155 170 100 170 C45 170 10 135 10 90 C10 45 45 10 100 10 Z",
  "M30 20 L30 80 L60 80 C80 80 90 70 90 55 C90 40 80 30 60 30 L30 30 Z",
];

export function LogoRevealMorph() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40">
      <motion.path
        d={MORPH_STEPS[0]}
        fill="var(--primary-500)"
        animate={{ d: MORPH_STEPS }}
        transition={{ duration: 3, times: [0, 0.33, 0.66, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
```

### Technique 3 — 3D Spin (React Three Fiber)
```typescript
'use client';
import { Canvas } from '@react-three/fiber';
import { Text3D, Center, Float, Environment } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import { Suspense } from 'react';

function Logo3DInner() {
  return (
    <motion.group
      initial={{ rotateY: Math.PI * 2, opacity: 0, scale: 0.5 }}
      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Center>
          <Text3D font="/fonts/rakkas.json" size={1.2} height={0.3}
            bevelEnabled bevelSize={0.02}>
            قلم
            <meshPhysicalMaterial color="var(--primary-500)" metalness={0.3} roughness={0.1} />
          </Text3D>
        </Center>
      </Float>
    </motion.group>
  );
}

export function LogoReveal3D() {
  return (
    <div className="h-48 w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}><Logo3DInner /></Suspense>
      </Canvas>
    </div>
  );
}
```

### Technique 4 — Kinetic Typography ★ RECOMMENDED
```typescript
'use client';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
};

const charVariants: Variants = {
  hidden:  { opacity: 0, y: 60, rotateX: 90, filter: 'blur(8px)', scale: 0.8 },
  visible: {
    opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

export function LogoRevealKinetic({
  text = 'PEN',
  language = 'en'
}: {
  text?: string;
  language?: 'en' | 'ar';
}) {
  const chars = text.split('');
  return (
    <div className="flex flex-col items-center gap-3" style={{ perspective: '800px' }}>
      <motion.div
        className="flex gap-1 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            variants={charVariants}
            className={`inline-block text-6xl font-bold text-[var(--primary-500)]
              ${language === 'ar' ? 'font-rakkas' : 'font-serif'}`}
            style={{ transformOrigin: 'bottom center' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {/* Animated underline */}
      <motion.div
        className="h-0.5 bg-[var(--primary-500)] rounded-full"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '100%', opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-sm tracking-[0.3em] uppercase text-[var(--text-secondary)]"
      >
        {language === 'ar' ? 'منصة إبداعية' : 'Creative Platform'}
      </motion.p>
    </div>
  );
}
```

### Signature Mix (Trim Paths → Kinetic)
```typescript
'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoRevealTrimPaths } from './LogoRevealTrimPaths';
import { LogoRevealKinetic } from './LogoRevealKinetic';

export function LogoRevealSignature({ text = 'PEN' }: { text?: string }) {
  const [phase, setPhase] = useState<'stroke' | 'type'>('stroke');
  useEffect(() => {
    const t = setTimeout(() => setPhase('type'), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex items-center justify-center h-40">
      <AnimatePresence mode="wait">
        {phase === 'stroke' && (
          <motion.div key="stroke" exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}>
            <LogoRevealTrimPaths />
          </motion.div>
        )}
        {phase === 'type' && (
          <motion.div key="type"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}>
            <LogoRevealKinetic text={text} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

<a name="s9"></a>
## 🌑 §9 — DARK / LIGHT MODE SYSTEM

### Full Token System (globals.css)
```css
/* ─── LIGHT MODE ─── */
:root {
  --bg-canvas:     #ffffff;
  --bg-primary:    #ffffff;
  --bg-secondary:  #f5f6fa;
  --bg-tertiary:   #ededf5;
  --bg-elevated:   #ffffff;
  --bg-overlay:    rgba(0,0,0,0.5);

  --text-primary:   #0a0a12;
  --text-secondary: #4a4a6a;
  --text-muted:     #8a8aaa;
  --text-disabled:  #c0c0d0;
  --text-inverse:   #ffffff;

  --border:        rgba(0,0,0,0.08);
  --border-strong: rgba(0,0,0,0.18);
  --border-focus:  var(--primary-500);

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow:    0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.12);
  --shadow-xl: 0 32px 64px rgba(0,0,0,0.16);

  --hover-bg:  rgba(0,0,0,0.04);
  --active-bg: rgba(0,0,0,0.08);
  --focus-ring:0 0 0 3px rgba(var(--primary-rgb),0.25);
}

/* ─── DARK MODE ─── */
.dark {
  --bg-canvas:     #04040a;
  --bg-primary:    #080810;
  --bg-secondary:  #0e0e1a;
  --bg-tertiary:   #141420;
  --bg-elevated:   #161622;
  --bg-overlay:    rgba(0,0,0,0.7);

  --text-primary:   #f0f0fa;
  --text-secondary: #a0a0c0;
  --text-muted:     #606080;
  --text-disabled:  #3a3a55;
  --text-inverse:   #0a0a12;

  --border:        rgba(255,255,255,0.06);
  --border-strong: rgba(255,255,255,0.14);

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
  --shadow:    0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.5);
  --shadow-xl: 0 32px 64px rgba(0,0,0,0.6);

  --hover-bg:  rgba(255,255,255,0.04);
  --active-bg: rgba(255,255,255,0.08);
  --focus-ring:0 0 0 3px rgba(var(--primary-rgb),0.4);
}
```

### Theme Provider
```typescript
// components/ThemeProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
type Resolved = 'dark' | 'light';

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; resolved: Resolved }>({
  theme: 'dark', setTheme: () => {}, resolved: 'dark'
});

export function ThemeProvider({ children, defaultTheme = 'dark' as Theme }) {
  const [theme, _setTheme] = useState<Theme>(defaultTheme);
  const [resolved, setResolved] = useState<Resolved>('dark');

  function setTheme(t: Theme) { _setTheme(t); localStorage.setItem('theme', t); }

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) _setTheme(saved);
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    setResolved(isDark ? 'dark' : 'light');
  }, [theme]);

  return <Ctx.Provider value={{ theme, setTheme, resolved }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
```

### Anti-Flash Script (layout.tsx head)
```typescript
// Prevents white flash on dark mode — must be first script
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    try {
      var t = localStorage.getItem('theme');
      var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) document.documentElement.classList.add('dark');
    } catch(e){}
  })();
`}} />
```

### Theme Toggle Button
```typescript
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const cycle = { dark: 'light', light: 'system', system: 'dark' } as const;
  const icons = { dark: <Moon size={16}/>, light: <Sun size={16}/>, system: <Monitor size={16}/> };

  return (
    <motion.button
      onClick={() => setTheme(cycle[theme])}
      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]
                 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                 hover:bg-[var(--hover-bg)] transition-colors"
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${cycle[theme]} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.span key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}>
          {icons[theme]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
```

### Glassmorphism
```css
.glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
}
:not(.dark) .glass {
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
}
```

---

<a name="s10"></a>
## 🌍 §10 — ARABIC & RTL SUPPORT

### HTML Root Setup
```typescript
// app/layout.tsx
<html lang="ar" dir="rtl" suppressHydrationWarning>
// OR bilingual:
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

### Always Use Logical CSS Properties
```css
/* ✅ Correct — auto-flips in RTL */
.element {
  margin-inline-start:  1rem;   /* left in LTR, right in RTL */
  margin-inline-end:    1rem;
  padding-inline:       1.5rem;
  border-inline-start:  2px solid var(--border);
  inset-inline-start:   0;
  text-align:           start;  /* left in LTR, right in RTL */
}

/* ❌ Never hardcode direction */
.element { margin-left: 1rem; padding-right: 1.5rem; }
```

### Bilingual Text Component
```typescript
interface LocalizedProps {
  ar: string;
  en: string;
  locale: 'ar' | 'en';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

export function L({ ar, en, locale, as: Tag = 'p', className }: LocalizedProps) {
  const isAr = locale === 'ar';
  return (
    <Tag
      className={`${isAr ? 'font-aljazeera arabic-body' : 'font-serif'} ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={locale}
    >
      {isAr ? ar : en}
    </Tag>
  );
}
```

### RTL-Aware Flex NavBar
```typescript
function NavBar({ isRTL = true }: { isRTL?: boolean }) {
  return (
    <nav className="flex items-center gap-6 px-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="me-auto"><Logo /></div>  {/* me = margin-end, always on outer side */}
      <ul className="flex gap-4 list-none">
        {navItems.map(item => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}
      </ul>
      <ThemeToggle />
    </nav>
  );
}
```

### Arabic Typography Rules
```css
/* Arabic needs MORE line height */
.arabic-body    { line-height: 1.9;  letter-spacing: 0; word-spacing: 0.05em; }
.arabic-heading { line-height: 1.4;  font-feature-settings: "calt" 1, "liga" 1; }
/* NEVER use letter-spacing with Arabic */

/* RTL icon flip — arrows, chevrons */
[dir="rtl"] .directional-icon { transform: scaleX(-1); }
```

---

<a name="s11"></a>
## 🧩 §11 — COMPONENT LIBRARY

### Button (CVA)
```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium
   transition-all duration-200 select-none cursor-pointer
   focus-visible:outline-none focus-visible:ring-2
   focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-2
   disabled:opacity-50 disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        primary:     `bg-[var(--primary-500)] text-white
                      hover:bg-[var(--primary-400)] active:bg-[var(--primary-600)]
                      shadow-md hover:shadow-lg`,
        secondary:   `bg-[var(--bg-secondary)] text-[var(--text-primary)]
                      border border-[var(--border)] hover:bg-[var(--hover-bg)]`,
        ghost:       `text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]
                      hover:text-[var(--text-primary)]`,
        glow:        `bg-[var(--primary-500)] text-white
                      shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]
                      hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.7)]
                      hover:scale-105 active:scale-95`,
        outline:     `border border-[var(--primary-500)] text-[var(--primary-500)]
                      hover:bg-[var(--primary-50)]`,
      },
      size: {
        sm:   'h-8  px-3  text-sm',
        md:   'h-10 px-4  text-sm',
        lg:   'h-12 px-6  text-base',
        xl:   'h-14 px-8  text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

### Card
```typescript
export function Card({ children, className, hover = true }: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      `rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]
       shadow-[var(--shadow)] p-6`,
      hover && `hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-strong)]
                hover:-translate-y-1 transition-all duration-300`,
      className
    )}>
      {children}
    </div>
  );
}
```

### Gradient Text
```typescript
export function GradientText({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn('bg-clip-text text-transparent', className)}
      style={{ backgroundImage: 'var(--gradient-text)' }}
    >
      {children}
    </span>
  );
}
```

### Section Wrapper
```typescript
export function Section({ children, className, id }: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn('px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto', className)}
    >
      {children}
    </section>
  );
}
```

### Utils
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

<a name="s12"></a>
## 🎨 §12 — BRANDING & VISUAL IDENTITY

### Spacing Scale
```
4px   Micro (icon-to-text gap)
8px   Tight (within component)
12px  Small (related items)
16px  Default (most used)
24px  Medium (section subdivisions)
32px  Large (content blocks)
48px  XL (section separations)
64px  XXL (hero padding)
96px  3XL (page-level)
128px 4XL (massive hero)
```

### Border Radius Scale
```
2px    Sharp (tables, code)
4px    Subtle (inputs, badges)
8px    Default (buttons, cards)
12px   Rounded (panels, modals)
16px   Soft (large cards)
24px   Very soft (hero elements)
9999px Pill (tags, chips)
```

### Project Structure
```
project/
├── app/
│   ├── layout.tsx        ← Fonts, ThemeProvider, anti-flash, metadata
│   ├── page.tsx          ← Home
│   ├── globals.css       ← Palette + tokens + fonts + reset
│   └── [locale]/         ← i18n routes (ar, en)
├── components/
│   ├── ui/               ← Button, Card, Badge, Input, Modal...
│   ├── sections/         ← Hero, Features, CTA, Pricing, Footer...
│   ├── three/            ← Scene, FloatingOrb, GlassText, StarField...
│   ├── animation/        ← Reveal, Stagger, PageTransition, Magnetic...
│   └── layout/           ← Header, Footer, NavBar, ThemeToggle...
├── lib/
│   ├── animations.ts     ← EASE, DUR constants
│   ├── gsap.ts           ← GSAP registration
│   └── utils.ts          ← cn()
├── public/
│   └── fonts/            ← Arabic TTF/OTF files
├── styles/
│   └── tokens.css        ← CSS custom properties (imported in globals)
└── DESIGN.md             ← Design decisions log
```

### Glow Effects
```css
.glow-primary {
  box-shadow:
    0 0 20px rgba(var(--primary-rgb), 0.3),
    0 0 60px rgba(var(--primary-rgb), 0.15),
    0 4px 16px rgba(0,0,0,0.3);
}

.btn-glow:hover {
  box-shadow:
    0 0 30px rgba(var(--primary-rgb), 0.5),
    0 4px 20px rgba(0,0,0,0.4);
}

.text-glow {
  text-shadow:
    0 0 20px rgba(var(--primary-rgb), 0.8),
    0 0 40px rgba(var(--primary-rgb), 0.4);
}
```

---

<a name="s13"></a>
## ✅ §13 — QUALITY GATES (Zero-Bug Checklist)

Run through EVERY item before considering any component done:

### TypeScript
- [ ] No `any` types — use `unknown` and narrow, or define proper interfaces
- [ ] All props explicitly typed
- [ ] `tsconfig.json` has `"strict": true`

### Visual
- [ ] All colors use `var(--token)` — no hardcoded hex
- [ ] Dark mode tested, looks correct
- [ ] Spacing uses Tailwind scale or CSS token

### Responsive
- [ ] Tested at 375px (mobile)
- [ ] Tested at 768px (tablet)
- [ ] Tested at 1280px (desktop)
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets ≥ 44×44px

### Accessibility
- [ ] All images have `alt` text
- [ ] Icon-only buttons have `aria-label`
- [ ] Color contrast ≥ 4.5:1 (normal) / 3:1 (large)
- [ ] Focus visible on all interactive elements
- [ ] Tab order is logical
- [ ] Heading hierarchy: h1 → h2 → h3 (no skipping)
- [ ] Landmarks present: `<main>`, `<nav>`, `<header>`, `<footer>`

### Animation
- [ ] `prefers-reduced-motion` respected (CSS + `useReducedMotion()`)
- [ ] No layout shift from animations
- [ ] Three.js disposes on unmount

### State & Data
- [ ] Loading state present for all async ops
- [ ] Error state handled (not white screen)
- [ ] Empty state designed (not blank)
- [ ] Form errors are clear and helpful

### Build
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` clean
- [ ] No `console.error` in production

### Common Bug Patterns to Avoid

```typescript
// ❌ Hydration mismatch
if (typeof window !== 'undefined') return <ClientComponent />;
// ✅ Fix
import dynamic from 'next/dynamic';
const ClientOnly = dynamic(() => import('./Client'), { ssr: false });

// ❌ GSAP outside useEffect
gsap.from('.element', { opacity: 0 });
// ✅ Fix
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.element', { opacity: 0 });
  });
  return () => ctx.revert(); // ALWAYS revert
}, []);

// ❌ Arabic letter-spacing
.arabic { letter-spacing: 0.1em; }
// ✅ Fix — never use letter-spacing with Arabic
.arabic { word-spacing: 0.05em; }

// ❌ Hardcoded direction
.icon { margin-left: 8px; }
// ✅ Fix
.icon { margin-inline-start: 8px; }
```

---

<a name="s14"></a>
## 🚀 §14 — EXECUTION WORKFLOW

When user gives ANY website task, follow this sequence:

```
STEP 1: UNDERSTAND (30 seconds)
  → Read package.json, globals.css, tailwind.config.ts, layout.tsx
  → Identify framework, styling system, existing patterns
  → Check DESIGN.md if exists

STEP 2: PLAN (think before coding)
  → List every file that needs to be created or modified
  → Identify which §sections to reference
  → If ambiguous, ask ONE clarifying question

STEP 3: DESIGN TOKENS FIRST
  → Define CSS tokens for this feature
  → Plan visual hierarchy and spacing grid
  → Choose animation approach

STEP 4: BUILD (TypeScript-first)
  → Write interfaces/types
  → Implement component structure
  → Add Tailwind classes using only token values
  → Add animations with reduced-motion fallback
  → Handle: loading + error + empty states

STEP 5: QUALITY CHECK
  → Run the §13 checklist mentally
  → Check responsive (375, 768, 1280px)
  → Verify dark mode
  → Verify RTL if Arabic present

STEP 6: PRESENT
  → Show complete, working implementation
  → Note key design decisions
  → Suggest next improvement
```

### Task-to-Section Routing
```
"Build hero section with 3D"    → §7 + §6 + §8 
"Create logo reveal"            → §8 + §6
"Set up design system"          → §4 + §5 + §9
"Add Arabic support"            → §10 + §5
"Make dark mode"                → §9
"Add scroll animations"         → §6
"Build button component"        → §11 + §12
"Fix design looks generic"      → §12 + §4 + §11
"New Next.js project"           → §3 + §4 + §5 + §9
"Add glassmorphism"             → §9 (glassmorphism section)
"Motion graphics / video"       → §6 (Remotion — install: npm install remotion)
```

---

<a name="s15"></a>
## 🔌 §15 — MCP INTEGRATIONS

When these are connected, use them proactively:

| MCP | Install | When to Use |
|-----|---------|-------------|
| **Chrome DevTools** | `npx -y @chrome-devtools/mcp` | Debug layout, CSS, performance, Core Web Vitals |
| **Higgsfield AI** | claude.ai → Settings → Connectors → `https://higgsfield.ai/mcp` | Hero images, background videos, avatar assets |
| **Blender MCP** | `pip install blender-mcp-server` | Create 3D models → export GLB → Three.js |
| **CMEM** | https://cmem.ai → register → connect | Persist design decisions across sessions |

---

<a name="s16"></a>
## 📦 §16 — COMPANION SKILLS (installed separately per project)

These skills work alongside pen-ultra.md. Claude knows they exist and uses them automatically when installed.

### Install all at once — copy and run in terminal:

```bash
# ── QUALITY & STYLE ──────────────────────────────────────────
# Stop generic AI frontends
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"

# Emil Kowalski animation philosophy (under 300ms, custom easing)
npx -y skills add emilkowalski/skill --skill emil-design-eng --agent claude-code

# Remove AI writing patterns from any text/copy
npx skills add https://github.com/hardikpandya/stop-slop --skill stop-slop

# Caveman — cuts 75% of Claude's output tokens, keeps accuracy
npx -y github:JuliusBrussee/caveman

# ── THREE.JS SUITE ───────────────────────────────────────────
npx skills add https://github.com/cloudai-x/threejs-skills --skill threejs-fundamentals
npx skills add https://github.com/cloudai-x/threejs-skills --skill threejs-animation
npx skills add https://github.com/cloudai-x/threejs-skills --skill threejs-materials
npx skills add https://github.com/cloudai-x/threejs-skills --skill threejs-interaction
npx skills add https://github.com/cloudai-x/threejs-skills --skill threejs-postprocessing

# ── DESIGN ───────────────────────────────────────────────────
npx skills add https://github.com/0xdesign/design-lab --skill design-lab

# Animate (Emil-based, working alternative)
npx skills add https://github.com/delphi-ai/animate-skill --skill animate

# ── AGENT INTELLIGENCE ───────────────────────────────────────
# 15 skills for context engineering & multi-agent systems
npx skills add https://github.com/muratcankoylan/agent-skills-for-context-engineering --skill context-engineering-collection

# ── GRAPHIFY (run separately after install) ───────────────────
pip install graphifyy && graphify install
# Then inside project folder:
# graphify .
```

### What each skill does for Claude:

| Skill | What Claude gains |
|-------|------------------|
| `design-taste-frontend` | Stops generating boring, templated, generic UI |
| `emil-design-eng` | Animates under 300ms, uses correct easing curves |
| `stop-slop` | Writes copy that sounds human, not robotic |
| `caveman` | Responds faster with 75% fewer tokens |
| `threejs-*` | Full 3D knowledge: scenes, shaders, particles, postFX |
| `design-lab` | Design exploration and visual decision-making |
| `animate` | Purposeful micro-interactions and motion |
| `context-engineering-collection` | Manages long sessions, multi-agent work |
| `graphify` | Understands entire codebase structure at once |

### Reference-only (no install needed — Claude reads on demand):
```
animate-ui.com          → UI component animation reference
remotion.dev            → npm install remotion  (when making video)
motion.dev/docs/react   → npm install motion    (when using Motion)
impeccable.style        → visual reference only
code.claude.com/docs    → Claude Code documentation
ui-skills.com           → skills directory reference
```

---

## ⚠️ MASTER ZERO-BUG PRINCIPLES

1. **Never hardcode** colors, font sizes, spacing — always `var(--token)` or Tailwind scale
2. **Never ignore** TypeScript errors — fix immediately, no `any`
3. **Never ship** without testing dark mode (if enabled)
4. **Never forget** `alt` on images, `aria-label` on icon buttons
5. **Never use** `letter-spacing` with Arabic text
6. **Always test** keyboard navigation (Tab, Enter, Escape, Arrow keys)
7. **Always add** loading + error + empty states
8. **Always check** mobile viewport (375px minimum)
9. **Always cleanup** Three.js, GSAP ScrollTrigger, event listeners in `useEffect`
10. **Always run** `npm run build` before declaring done

---

*PEN ULTRA v2.0*
*Crafted for production-grade, world-class websites*
*Arabic + English | Dark + Light | 3D + Motion | Zero Bugs*
*Fonts included: Rakkas · Palestine · Al-Jazeera (Bold/Regular/Light)*
*Companion skills: Taste · Emil · Stop-Slop · Caveman · Three.js Suite · Context Engineering · Graphify*
