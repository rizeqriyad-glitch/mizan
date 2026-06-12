# MIZAN — PROJECT MEMORY (web-genesis · file over app)

Newest first. One line per decision. Read me before any edit; append after every milestone.

- 2026-06-12 · §13 verification: `vite build` must pass twice clean; browser-console pass pending Chrome DevTools MCP (not connected this session).
- 2026-06-12 · Follow-ups logged: subset fonts to woff2 (`pyftsubset --layout-features='*'`, Python unavailable on this machine); remove `framer-motion` dep (19 files still import it — new code uses `motion/react`); rewrite legacy var() references file-by-file then delete the bridge.
- 2026-06-12 · Old `Mizan3DScene` kept for DayHistoryPage only — patched (rAF cancel + dispose, azure colors, particle alpha premultiply, idle skip). Landing uses new `MizanHero`.
- 2026-06-12 · Legacy token bridge lives in `globals.css` (`--mizan-*`, `--gold/--ruby/…`, `--accent-purple*`, `--v-*` → semantic tokens) so ~20 dashboard files reskin without edits. New code: semantic tokens only.
- 2026-06-12 · Hero = MizanHero.jsx: GLSL aurora quad (ambient) + glass scale (hero), beam tilt = f(completedToday/5), equilibrium glow at 5/5, burst on completion; lazy-init, pauses off-screen, dispose wired; mobile/low-end/reduced-motion → aurora only / CSS `.aurora`.
- 2026-06-12 · Logo = concept B "Minaret Pillar" (Higgsfield nano_banana job `8848707d`, bg-removed `04e9fb26`, Adobe-vectorized → `public/brand/mizan-logo-vectorized.svg` as raster-trace reference). Shipped mark = hand-clean 48-grid redraw in `MizanMark.jsx`, currentColor, 4 motion states, props API unchanged.
- 2026-06-12 · Fonts: Palestine = wordmark + AR h1 only (single weight 400, ≥28px); Al Jazeera 300/400/700 = AR body/UI/h2-h3; Noto Serif = EN display; Inter = EN UI; Amiri = Quran text only. Local files in `public/fonts/`. Never letter-space Arabic (enforced globally).
- 2026-06-12 · Palette = "Midnight Fajr": prussian-950 night bg + jet-900 surfaces + azure-400/600 primary (dawn light) + crimson-carrot ≤10% accent (ember) + quiet fern success. Light theme: jet-50 tints + azure-600.
- 2026-06-12 · Client approved: logo B + Midnight Fajr palette + Living Mizan 3D ("yes for all").
- 2026-06-12 · Audit of live site (mizantasks.cloud = this repo): 16/40 across 8 axes; headline problems: typography (7 families, faux-bold Palestine, tracked Bismillah), performance (994B SPA shell, font 404s, leaky 3D), borrowed PEN identity.
- 2026-06-12 · Brand: ميزان (Mizan), Arabic primary RTL / English secondary; lockup = mark + «ميزان» in Palestine; guests default ar/dark, persisted in localStorage (`mizan.lang`, `mizan.theme`); profile values win for signed-in users.
