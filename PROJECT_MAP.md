# PROJECT_MAP.md — Mizan (ميزان)

Map-first index for this repo. Query this instead of grepping. One line per file:
`name · path · purpose`. Update after structural changes.

## Stack
Vite 8 + React 18 (JSX, **no TypeScript**) · React Router 6 · Firebase 10
(Auth + Firestore) · framer-motion 10 + motion 12 · @dnd-kit (drag/drop) ·
lucide-react · date-fns · Three.js via CDN (`three@0.160`). Inline-style-first,
CSS custom properties for tokens, two global stylesheets.

## Product identity (inferred — see `## product-dna`)
Mizan = "ميزان" = balance / scales. An **Islamic productivity companion**:
the 5 daily prayers anchor a day built around tasks, dhikr, Quran, adhkar,
focus timer, notes, weekly planner, analytics. Tagline: "Balance in All Things"
/ "التوازن في كل شيء". Bilingual AR/EN with full RTL.

## design-direction
**Calm-precise spiritual-tech.** Deep night-sky canvas (purple/cyan) with
glass surfaces and gold-free, unified Mizan palette; motion is gentle and
purposeful (the scale settling into balance), never flashy. One signature
moment: the balancing ميزان logo mark. Texture = glass. Motion personality =
gentle spring (damping 14 / stiffness 120).

## Tokens (current source of truth → `src/styles/globals.css`)
purple `#6c47ff` · cyan `#00c9ff` · gradient `135deg purple→cyan` ·
dark canvas `#020617/#0f172a` · semantic success/warning/error/info ·
radius sm6 md10 lg16 xl24 full · fonts AR Cairo / EN Sora / brand Palestine
(special — gated) / Quran Amiri. Legacy jewel tokens (gold/ruby/emerald/
sapphire/amber) bridged → Mizan palette (see `## fixes`).

---

## Files

### Entry / app shell
- `index.html` · root · HTML shell, font preconnect+links, favicon (was 404 — fixed).
- `src/main.jsx` · src · React root, BrowserRouter + AuthProvider + AppProvider, imports both stylesheets.
- `src/App.jsx` · src · Route table, ProtectedRoute guard, LoadingScreen.
- `src/firebase.js` · src · Firebase init (auth, db, googleProvider).

### Contexts
- `src/contexts/AuthContext.jsx` · contexts · Google auth, user profile load/create, updateProfile.
- `src/contexts/AppContext.jsx` · contexts · Core app state: language/theme/timeFormat, prayer times+method, tasks, sections, prayers, stats, goals, gamification, schedule blocks; Firestore subscriptions; `t()` translations (en/ar).

### Pages
- `src/pages/LandingPage.jsx` · pages · Public marketing/landing; 3D scene hero, features, CTA.
- `src/pages/LoginPage.jsx` · pages · Google sign-in screen.
- `src/pages/DashboardPage.jsx` · pages · Main daily hub: prayer sections, tasks, stats, widgets.
- `src/pages/PlannerPage.jsx` · pages · Weekly planner: goals, milestones, gamification (largest file, 1979 lines).
- `src/pages/NotesPage.jsx` · pages · Notes & benefits browser with search/categories.
- `src/pages/AnalyticsPage.jsx` · pages · Productivity analytics/charts.
- `src/pages/SettingsPage.jsx` · pages · Language, theme, time format, prayer method, alerts.
- `src/pages/DayHistoryPage.jsx` · pages · Past-day review w/ 3D scene (route was missing — fixed).

### Layout & navigation
- `src/components/Layout.jsx` · components · Authenticated shell: sidebar nav, user profile, digital clock, theme toggle, sign-out, mobile drawer, mounts notifiers + `<Outlet/>`.

### Feature sections
- `src/components/TaskSection.jsx` · components · Per-section task list, add/edit/delete/reorder, durations/reminders.
- `src/components/PrayerTimesWidget.jsx` · components · Current/next prayer + times list.
- `src/components/DhikrSection.jsx` · components · Tap-counter daily dhikr.
- `src/components/AdhkarSection.jsx` · components · Morning/evening adhkar with source/virtue.
- `src/components/QuranReader.jsx` · components · Surah picker + verses + translation (fetches API).
- `src/components/FocusTimer.jsx` · components · Pomodoro focus/break timer.
- `src/components/NotesSection.jsx` · components · Inline note capture with categories.
- `src/components/ScheduleManager.jsx` · components · Custom schedule blocks CRUD + reorder.
- `src/components/TodaySchedule.jsx` · components · Today's schedule summary.
- `src/components/StatsBar.jsx` · components · Streak/points/prayers stat row.

### Notifiers
- `src/components/AdhanNotifier.jsx` · components · Plays adhan + notification at prayer times.
- `src/components/ReminderNotifier.jsx` · components · Task reminder notifications.

### 3D / brand
- `src/components/Mizan3DScene.jsx` · components · Three.js scene (used by Landing + DayHistory).
- `src/components/Mizan3DBackground.jsx` · components · Three.js ambient background (currently unused by pages).
- `src/components/Logo.jsx` · components · Heavy per-instance WebGL scale logo (unused; superseded by SVG MizanMark).
- `src/components/MizanMark.jsx` · components · **NEW** lightweight interactive SVG ميزان logo (mark + lockup + 4 motion states).
- `src/components/icons3d/` · components · Canvas3DIcon, TaskCheckmark3D, PrayerBeads3D, MoreIcons3D + barrel `index.js`.

### Hooks / utils / styles
- `src/hooks/useLookAt.js` · hooks · Cursor-tilt (perspective rotateX/Y) with reduced-motion guard.
- `src/hooks/useScrollReveal.js` · hooks · **NEW** IntersectionObserver reveal + magnetic-CTA helpers (reduced-motion safe).
- `src/utils/prayerTimes.js` · utils · Prayer-time fetch + calc-method resolution.
- `src/utils/dateUtils.js` · utils · `getTodayKey()` and date helpers.
- `src/utils/alarmSound.js` · utils · Adhan/alarm audio.
- `src/utils/alarmStorage.js` · utils · Alarm persistence.
- `src/styles/globals.css` · styles · Tokens, themes (dark/light), reset, glass utils, keyframes, reveal, reduced-motion.
- `src/styles/components.css` · styles · Reusable classes: buttons, cards, badges, inputs, type scale, layout/grid utils, RTL.

---

## audit (Phase 2 — 2026-06-11)

### Top UI flaws
1. **Color hierarchy broken** — ~280 references to undefined jewel tokens render colorless; primary accents, active states, and semantic colors silently fail.
2. **Contrast** — `--text-muted` (#64748b) on dark card sits ~3.8:1, under the 4.5:1 body floor; placeholders inherit it.
3. **Density/rhythm** — uniform padding and cloned card grids across sections; no deliberate spacing rhythm.
4. **Motion** — entrance animations exist but several CSS animations lack paired reduced-motion exceptions beyond the global blanket; logo 3D rebuilds every render.
5. **Copy** — emoji used as primary iconography (⚖️ ☰ ◈) instead of a real icon set; brand mark is an emoji in the sidebar.

### Bugs / broken states
- **Undefined tokens** (gold/ruby/emerald/sapphire/amber + `-dim`, `--v-glass-*`, `--v-shadow`) — app-wide dead colors. → fixed via bridge.
- **Missing route** `/dashboard/history` — nav links to it, page exists, no `<Route>` → redirects to landing. → fixed.
- **Favicon 404** — `index.html` references `/mizan-icon.svg`, file absent → failed request every load. → fixed.
- **Logo.jsx effect deps** `[sizes, theme]` where `sizes` is a fresh object each render → WebGL teardown/rebuild every render (perf/leak risk). (Logo unused; SVG mark supersedes.)
- **Special font applied unprompted** — AppContext injects `font-family: var(--font-brand) !important` (Palestine) on all headings, violating the ask-first rule. → raised in Phase 5.

### Accessibility
- Icon-only buttons (mobile menu ☰, theme toggle, sign-out) lack `aria-label`.
- Decorative emoji not hidden from AT (`aria-hidden`).
- Muted text contrast under 4.5:1 (see flaw 2).
- Focus-visible ring defined globally (good) but some inline-styled buttons override with no focus style.

### Animation performance
- Logo.jsx full `WebGLRenderer` per instance + per-render rebuild.
- Multiple components animate via inline-style transitions on hover handlers that can be overwritten by other style writes (specificity foot-gun).
- Reduced-motion handled globally in globals.css (good baseline); JS-driven motion (useLookAt) guards correctly.

## fixes
- 2026-06-11 · undefined jewel + v-glass tokens app-wide · added theme-aware bridge layer mapping gold→purple, ruby→error, emerald→success, sapphire→cyan, amber→warning, v-glass→glass · `src/styles/globals.css`.
- 2026-06-11 · `/dashboard/history` route absent · added `<Route path="history">` · `src/App.jsx`.
- 2026-06-11 · favicon 404 · added `public/mizan-icon.svg` (SVG ميزان mark) · `public/`.
- 2026-06-11 · muted text under 4.5:1 (dark ~4.0, light ~2.5) · darkened `--text-muted`/`--text-secondary` both themes · `src/styles/globals.css`.
- 2026-06-11 · icon-only mobile menu had no accessible name; toggle/sign-out emoji read by AT · added `aria-label` + `aria-hidden` · `src/components/Layout.jsx`.
- 2026-06-11 · Login Google CTA used dark `--text-primary` on gradient (fails contrast in light) · set white · `src/pages/LoginPage.jsx`.

## touched (session 2026-06-11)
- NEW `src/components/MizanMark.jsx` · interactive SVG ميزان logo (mark+lockup, 4 motion states, reduced-motion safe, unique gradient ids).
- NEW `src/hooks/useScrollReveal.js` · `useScrollReveal` (IO reveal) + `useMagnetic` (CTA pull); both reduced-motion/touch aware, full cleanup.
- NEW `public/mizan-icon.svg` · favicon mark.
- NEW `PROJECT_MAP.md`, `PRODUCT_DNA.md`.
- EDIT `src/styles/globals.css` · token bridge, motion-personality token, a11y contrast.
- EDIT `src/App.jsx` · history route, MizanMark loading screen (role=status).
- EDIT `src/components/Layout.jsx` · MizanMark brand (sidebar + mobile), a11y labels.
- EDIT `src/pages/LandingPage.jsx` · MizanMark in nav (replaced one-off SVG).
- EDIT `src/pages/LoginPage.jsx` · MizanMark logo (replaced ⚖️ emoji), white CTA text.
- EDIT `src/pages/DashboardPage.jsx` · premium header (eyebrow + gradient name), branded MizanMark loader (role=status), activated `useScrollReveal`, reveal wrappers on Adhkar/Quran.
- EDIT `src/pages/PlannerPage.jsx` · header eyebrow + gradient title, gradient primary "New Goal" CTA, GoalCards given theme-aware surface + hover lift, fixed off-palette warm-gold hovers/toast-shadow → Mizan purple.

## design-decisions
- Fonts: Palestine kept on ALL headings (user choice, 2026-06-11); Cairo (AR) / Sora (EN) for body — `--font-brand` injection in AppContext left intact.
- Logo: lightweight SVG `MizanMark` is the canonical brand mark; `Logo.jsx` (per-instance WebGL) left in place but unused/superseded.
</content>
