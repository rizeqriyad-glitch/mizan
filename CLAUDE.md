# CLAUDE.md — Mizan | ميزان Platform

This file is read automatically at the start of every Claude Code session.
All modifications to this project follow these rules without exception.

---

## 🎯 Project Identity

**Platform:** Mizan (ميزان) — The leading Arabic student tasks and electronic exams platform (https://www.mizantasks.cloud/)
**Stack:** Next.js 14 + TypeScript + Inline Styles
**Audience:** Arabic-speaking students and educators seeking precise task management and professional evaluation
**Site Soul:** "Precision in Achievement" — technical precision + absolute productivity + authentic Arabic identity

---

## 🎨 Active Design Skill: ultra-web-design

This skill is always active on all frontend files.
Every edit to any file inside apps/web/ must automatically follow these standards:

---

### Rule 1: Understand the Component's Soul Before Editing

Before touching any file, ask:
1. What is this component's function?
2. Who will see it? (New visitor / student / teacher / admin)
3. What feeling should it leave? (Organization, clarity, focus, and achievement)
4. Is there an opportunity to reinforce Mizan's visual identity?

---

### Rule 2: Visual Identity System

[--- MIZAN TOKENS START ---]
Core Colors:
  --mizan-purple:   #6c47ff   ← Primary brand color (Visionary Focus)
  --mizan-cyan:     #00c9ff   ← Complementary accent (Dynamic Energy)
  --mizan-dark:     #0f172a   ← Dark background
  --mizan-surface:  #ffffff   ← Light surfaces
  --mizan-base:     #f8fafc   ← Page background

Primary Gradient:
  linear-gradient(135deg, #6c47ff, #00c9ff)

Typography:
  Arabic:  'Cairo', sans-serif      (weights: 400, 600, 700, 900)
  English: 'Sora', sans-serif       (weights: 400, 600, 700, 800)
  Code:    'Fira Code', monospace

Border Radius:
  Small cards:  12px
  Large cards:  16–20px
  Icons:        14–18px
  Buttons:      10–12px
[--- MIZAN TOKENS END ---]

---

### Rule 3: Three.js for Hero Sections

When to add Three.js:
- Any landing page or hero section
- Any hero section that is visually empty
- Any section that needs a "wow moment"

Three.js rules for Mizan platform:
// Always use this CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';

// Best 3D objects for a task and exam management platform:
// ← Floating 3D balanced scales (ميزان) rotating gently, representing accuracy and justice
// ← Interactive 3D checkboxes / task blocks completing or checking off dynamically
// ← Progress rings / completion spheres mapping user activity
// ← Geometric Arabic letters forming "ميزان" morphing smoothly

// Mouse interaction — mandatory in every scene
document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// Spring smoothing — always, never snap directly
target.x += (mouse.x - target.x) * 0.05;
target.y += (mouse.y - target.y) * 0.05;

---

### Rule 4: Glass Icons for Categories & Features

When to apply:
- Task & Exam category cards
- Feature icons (timers, grading, tracking)
- Stats counters & dashboards

Mandatory glass pattern for Mizan:
.glass-icon-mizan {
  background: linear-gradient(135deg, rgba(108,71,255,0.2) 0%, rgba(0,201,255,0.08) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(108,71,255,0.25);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(108,71,255,0.15), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(108,71,255,0.1);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.glass-icon-mizan::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), transparent 60%);
  pointer-events: none;
}
.glass-icon-mizan:hover {
  transform: perspective(400px) rotateY(-8deg) rotateX(4deg) translateY(-6px);
  box-shadow: 16px 16px 40px rgba(108,71,255,0.25), inset 0 1px 0 rgba(255,255,255,0.5);
}

---

### Rule 5: Motion System

All animations use these values:
/* Spring bounce — for buttons and cards */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth elastic — for content and menus */
--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);

/* Transition durations */
--dur-fast:   200ms   /* hover states */
--dur-normal: 400ms   /* page reveals */
--dur-slow:   700ms   /* scroll animations */

Scroll Reveal — mandatory on every section:
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

[data-reveal] {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity var(--dur-slow) var(--ease-smooth), transform var(--dur-slow) var(--ease-smooth);
}
[data-reveal].revealed { opacity: 1; transform: translateY(0); }
[data-reveal]:nth-child(1) { transition-delay: 0ms; }
[data-reveal]:nth-child(2) { transition-delay: 80ms; }
[data-reveal]:nth-child(3) { transition-delay: 160ms; }
[data-reveal]:nth-child(4) { transition-delay: 240ms; }

Magnetic Buttons — on every primary CTA:
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  });
});

---

### Rule 6: Remotion for Videos

When to use Remotion:
- Requested intro or task explainer video
- Hero background video loop
- Animated dashboard onboarding sequences

Command to create a new video clip:
npx create-video@latest apps/video

---

### Rule 7: Icon Library: Font Awesome Free

Always available for use in this project for high-quality icons.

Installation:
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/react-fontawesome

Import in component:
import { icon } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIconName } from '@fortawesome/free-solid-svg-icons'

React usage:
<FontAwesomeIcon icon={faIconName} />

Use Font Awesome icons instead of emoji or custom SVG wherever possible.
Prefer solid ('fas' / 'free-solid-svg-icons') for UI, tasks, checklists, and counters,
regular ('far' / 'free-regular-svg-icons') for decorative background or outlined elements.

---

### Rule 8: Anti-Generic Checklist

Before finishing any edit, verify:
- [ ] Is the font Cairo or Sora? (No Inter, no Roboto)
- [ ] Are the colors from Mizan's corporate palette?
- [ ] Is there at least one "wow" moment on the page (animation or 3D)?
- [ ] Is RTL/LTR support preserved perfectly for Arabic tasks?
- [ ] Is `prefers-reduced-motion` respected?
- [ ] Are all API calls and state untouched?

---

## 🔒 Rules That Must Never Be Broken

✅ Preserve all useEffect, useState, useLanguage, useAuth
✅ Preserve all t() bilingual translations
✅ Preserve all href values and internal links (mizantasks.cloud paths)
✅ Preserve API_BASE and all fetch calls
✅ Preserve direction: isArabic ? 'rtl' : 'ltr'
✅ Three.js only from the CDN specified above

❌ Never delete any existing prop or function
❌ Never change any text inside t('...', '...')
❌ Never use localStorage inside artifacts
❌ Never add new dependencies without mentioning them

---

## 📁 Key File Map

apps/web/
├── app/
│   ├── page.tsx            ← Homepage (Hero + Dashboards Overview + Features)
│   ├── globals.css         ← CSS Variables + Animations + Grids
│   ├── layout.tsx          ← Root layout
│   ├── tasks/              ← Student tasks & homework tracking management
│   ├── dashboard/          ← Main Student / Teacher Workspace Dashboard
│   ├── auth/               ← OTP / Passwordless Login & Registration
│   └── exams/              ← Electronic exams & quiz generation engine
├── components/
│   ├── Navbar.tsx          ← Top navigation bar
│   ├── Footer.tsx          ← Footer
│   └── Logo.tsx            ← Brand logo (Mizan Scales Identity)
└── lib/
    └── tasks-store.tsx     ← Central state management for workflows

---

## 🚀 How the Skill Is Applied

### When editing an existing page:
1. Read the full file first
2. Identify: Where can Three.js go? Where do Glass Icons fit? Where does Scroll Reveal help?
3. Apply visual enhancements only
4. Run the Anti-Generic Checklist
5. Confirm all logic is untouched

### When creating a new component:
1. Use Glass morphism as the base style for task panes
2. Add spring animation on hover
3. Support RTL from the start
4. Use Mizan's official fonts and colors

### When adding a new section to the homepage:
1. Add `data-reveal` for scroll reveal
2. If it's a hero section → add Three.js canvas (floating balanced scales or task nodes)
3. If it has icons → use glass-icon-mizan style
4. If it has a CTA → add btn-magnetic class

---

## 🎨 Additional Design Skills

Two extra skill sets are now merged into this project: frontend-ui-engineering (Addy Osmani) and impeccable (pbakaus). Apply their rules on every frontend edit. Where a rule conflicts with Mizan's established identity (gradient text, glassmorphism, eyebrow badges), Mizan's rule takes precedence.

---

### A: Component Architecture (frontend-ui-engineering)

Composition over configuration:
Good: <Card><CardHeader>...</CardHeader><CardBody>...</CardBody></Card>
Bad: <Card title="X" headerVariant="large" bodyPadding="md" content={...} />

Separate data from presentation:
- Container component → fetches data, handles loading/error/empty states
- Presentation component → pure rendering, no side effects

State management ladder — choose the simplest that works:
useState      → component-local UI state
Lifted state  → shared between 2–3 siblings
Context       → theme, auth, locale (read-heavy, write-rare)
URL params    → filters, pagination, shareable state
React Query   → remote data with caching
Zustand       → complex client state shared app-wide

Never prop-drill deeper than 3 levels. Introduce context or restructure instead.

Red flags to never ship:
- Component exceeds 200 lines → split it
- Inline styles or arbitrary pixel values (use Mizan's token scale)
- Missing loading state, error state, or empty state
- No keyboard navigation

---

### B: Accessibility — WCAG 2.1 AA (frontend-ui-engineering)

Every interactive element must be keyboard accessible. Prefer semantic HTML over div + role.
Example: <button aria-label="Close dialog"><XIcon /></button>
Form inputs must have a label: <label htmlFor="email">Email</label><input id="email" type="email" />

Focus management: move focus when content changes (dialogs, step flows). Trap focus inside modals.
Empty and error states must be meaningful:
<div role="status" className="text-center py-12">
  <EmptyIcon />
  <h3>لا توجد مهام حالياً</h3>
  <p>ابدأ بإضافة أول مهمة أو اختبار للمتابعة.</p>
  <Button onClick={onBrowse}>إضافة مهمة جديدة</Button>
</div>

---

### C: Typography Rules (impeccable)

- Body line length: cap at 65–75 characters (max-width: 70ch).
- Scale contrast: each heading step must be >= 1.25x the step below it.
- Font families: maximum 2 (Cairo + Sora — do not add more).
- Hero heading ceiling: clamp() max <= 6rem (~96px).
- Display letter-spacing floor: >= -0.04em. Tighter looks cramped.
- No all-caps body copy.

---

### D: Color & Contrast (impeccable)

- Body text: >= 4.5:1 contrast against its background.
- Gray text on a colored background: use a darker shade of the background's own hue, not a generic gray.
- Tinted neutrals: tint toward Mizan's brand hue (purple), not toward a generic warm or cool default.

---

### E: Layout & Motion Rules (impeccable)

Layout:
- Use Flexbox for 1D layouts, Grid for 2D.
- Responsive grids without breakpoints: repeat(auto-fill, minmax(280px, 1fr)).
- Build a semantic z-index scale: dropdown → sticky → modal-backdrop → modal → toast → tooltip. Never arbitrary values.

Motion:
- Motion is intentional, planned as part of the build.
- Don't animate CSS layout properties (width, height, top, left) use transforms.
- Ease out with exponential curves. Mizan's --ease-spring is for buttons/cards only — for content reveals use --ease-smooth.
- prefers-reduced-motion is mandatory on every animation.

---

### F: UX Copy Rules (impeccable)

- Every word earns its place. No intros that repeat the heading.
- No em dashes. Use commas, colons, semicolons, or parentheses.
- No buzzwords: streamline / empower / leverage / next-generation / seamless. Pick a specific verb that describes what the feature literally does.
- Button labels: verb + object. "حفظ التغييرات" beats "موافق". "حذف الاختبار" beats "نعم".

---

### G: Absolute Bans (impeccable — note Mizan exceptions below)

Banned Trends vs What to do instead:
- Side-stripe border-left/right > 1px as accent → Use full border, background tint, or icon instead.
- Identical card grids (same size, icon+heading+text repeated) → Vary card sizes, use list rows, or prioritize content.
- Eyebrow badge on every section → Use eyebrows deliberately — not as scaffolding on every heading.
- Numbered section markers (01 / 02 / 03) as default scaffolding → Only when the section is a real numbered sequence.
- border-radius: 32px+ on cards/inputs → Cards: max 16–20px (Mizan tokens). Full-pill only for tags/badges.
- border: 1px solid X + box-shadow with blur >= 16px on same element → Pick one: a solid border OR a defined shadow (<= 8px blur).

Mizan exceptions:
- Gradient text (.gradient-text) is part of Mizan's brand — use it on hero headings and score highlights. Do not use it on body text.
- Glassmorphism (.glass-card, .glass-icon) is Mizan's design language — use it purposefully on task modules and tracking cards.
- Section eyebrow badges (.section-eyebrow) are allowed on major sections — limit to 2–3 per page.

---

### H: The "AI-Made" Test (impeccable)

Before shipping any UI, ask: could someone look at this and say "AI made that" without doubt?
Common tells on Mizan specifically:
- Hero clamp > 6rem (too loud)
- Eyebrow badge on every section heading (AI scaffold)
- Identical glass cards repeated in a uniform grid (lazy layout)
- Bounce/elastic easing on content reveals (should only be on micro-interactions/buttons)
- Missing empty states for tasks lists.

---

## Motion Design Skill — Remotion-Inspired Animation Principles

Inspired by Remotion (remotion.dev) — programmatic, frame-precise, physics-based motion.

---

### Core Philosophy

Animation is a function of time. Every visual change must be driven by a single time value.
Never use standard CSS transitions for complex motion sequences — use JS-driven requestAnimationFrame + elapsed time in ms:

Equivalent of interpolate() without Remotion:
const lerp = (t: number, from: number, to: number) => from + (to - from) * Math.min(1, Math.max(0, t));

Critically Damped Spring for accurate physical snapping:
let pos = 0, vel = 0;
const stiffness = 180, damping = 20, mass = 1;
const tick = (dt: number, target: number) => {
  const force   = -stiffness * (pos - target);
  const damper  = -damping * vel;
  const accel   = (force + damper) / mass;
  vel += accel * dt;
  pos += vel * dt;
  return pos;
};

---

### Animation Choreography Rules

Stagger — offset list items (like task entries) by 40–80ms to create rhythmic cascades:
const delay = index * 0.06;
const frame = Math.max(0, elapsed - delay * 1000);

Motion in RTL (Arabic) Context:
- translateX direction MUST be inverted for RTL layouts.
- Slide-in from right in LTR = slide-in from LEFT in RTL.
- Always check document.dir or isArabic prop before applying positional shifts.

---

### Integration with Mizan Platform Design Tokens

Motion must always use Mizan colors for particles, timers and glows:
  Primary:  #6c47ff (purple)
  Accent:   #00c9ff (cyan)
  Glow:     rgba(108,71,255,0.4)

---

## Spline/Hana Interactive Design Skill

Inspired by Spline Hana (spline.design/hana) — state-based, event-driven, GPU-accelerated interactive experiences.

---

### Look At Interaction (cursor tracking for Mizan Cards)

Cards and interactive components should subtly tilt towards the cursor to create depth:

const useLookAt = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `perspective(600px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg)`;
      el.style.transition = 'transform 0.1s ease-out';
    };
    const reset = () => {
      el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    };
    el.addEventListener('mousemove', handler);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', handler);
      el.removeEventListener('mouseleave', reset);
    };
  }, []);
};

---

### Mizan Platform Application Rules

Apply Spline/Hana principles to Mizan components:

Cards (task cards, exam tokens, statistics):
→ useLookAt for 3D tilt on hover
→ State machine: base → hover (lift + glow) → active (press)
→ Glass morphism background matching .glass-icon-mizan
→ Stagger reveal on scroll

Buttons & CTAs:
→ State machine: base → hover (scale 1.03) → active (scale 0.97)
→ Glow effect on hover using #6c47ff shadow
→ 80ms press transition (instant feel)

Hero sections:
→ Scroll-reveal with staggered animation for children
→ Background canvas nodes use a subtle drift follow constraint
→ Entrance curve: opacity + translateY with expo-out 600ms

---

### Anti-Patterns — NEVER DO THESE

❌ Animating layout-triggering properties (width/height/top/left) — always use transform
❌ Multiple simultaneous rAF loops — one loop rules all canvases
❌ Ignoring prefers-reduced-motion media query
❌ Hardcoded pixel values for animations — adapt fluidly to screen scales
❌ Gating layout/data visibility behind JS triggers alone (breaks SSR)