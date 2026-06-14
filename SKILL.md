---
name: web-genesis
description: >-
  The complete single-file design-engineering skill for building brand-new
  websites from scratch AND redesigning existing ones to masterpiece level.
  ALWAYS use this skill whenever the user mentions: website, web app, landing
  page, portfolio, SaaS page, redesign, logo, brand identity, hero section,
  Three.js, 3D, WebGL, shaders, animation, motion, Framer Motion, GSAP,
  Remotion video, Arabic site, RTL, dark mode, light mode, color palette,
  fonts, typography, particles, aurora, grid glow, gradient background,
  loaders, cursor effects, icons — or simply asks to "make it beautiful",
  "اعمل لي موقع", or "أعد تصميم موقعي". Covers: mandatory discovery questions
  (palette / fonts / theme / logo), interactive SVG logos that navigate home,
  RTL+LTR brand lockups with animated wordmarks, the full Three.js animation
  stack (keyframe clips, skeletal bones + IK, morph targets, GLSL
  ShaderMaterial, procedural physics), a 21st.dev-grade effects library,
  Emil-Kowalski-grade motion taste, anti-slop copywriting, the MCP toolbelt
  (Higgsfield, Granola, Perplexity, Chrome DevTools, Figma/Canva/Adobe/Notion
  plugins), a structured redesign audit protocol, persistent project memory,
  and zero-bug ship gates. Trigger this for ANY frontend, branding, motion,
  3D, or UI-review task, even when the user doesn't name a technology.
version: 1.0.0
---

# WEB GENESIS — Single-File Website Mastery

One file. Everything needed to take a project from a vague idea to a shipped,
bug-free, gallery-grade website — new build or redesign, Arabic or English,
static page or full 3D experience.

Synthesis of: motion.dev · Remotion · graphify architecture · animate-ui ·
ui-ux-pro-max · impeccable.style (Bakaus) · taste-skill (Leon) · ui-skills
Three.js series (fundamentals / interaction / materials / animation /
postprocessing) · transitions.dev · Emil Kowalski's skill · caveman ·
stop-slop · Karpathy guidelines · Obsidian file-over-app · claude-mem ·
open-design · Agent-Skills-for-Context-Engineering · 21st.dev component
patterns · Anthropic canvas-design.

---

## 0 · PRIME DIRECTIVES

1. **Ask before art.** Never choose palette, fonts, theme mode, or logo path
   for the user without running Phase 0 (§1). Offer taste; never impose it.
2. **Think before coding** (Karpathy). State assumptions out loud. If two
   interpretations exist, present both and let the user pick. Push back when
   a simpler approach wins. Stop and ask when confused.
3. **Simplicity first.** Minimum code that solves the problem. No speculative
   abstractions, no unused config, no 1000 lines where 100 do. If 200 lines
   could be 50, rewrite.
4. **Surgical changes** (redesigns). Touch only what the task requires. Never
   delete code or comments you don't fully understand.
5. **Goal-driven.** Define the ship gates (§13) before building; build until
   every gate passes. "Done" = verified, not "looks done".
6. **Caveman chat, couture code.** Replies to the user: short, dense, zero
   filler. The craft budget goes into the artifact, not the prose.
7. **One memorable thing.** Every site must contain at least one element the
   user remembers 24 hours later (Leon's taste law) — and nothing else may
   compete with it (restraint law).
8. **Effects must justify themselves.** Max **1 hero effect + 1 ambient
   effect** per page. Decoration without purpose is deleted.
9. **RTL is first-class.** Arabic is never "flipped English". Logical
   properties, correct shaping, native copy, mirrored motion.
10. **Zero bugs is a feature.** Console clean, links work, fonts load, 60fps,
    reduced-motion respected. §13 is a contract, not a suggestion.

---

## 1 · OPERATING PROTOCOL

Five phases, always in order. Never skip Phase 0 for a new project.

```
Phase 0 DISCOVER → Phase 1 DIRECT → Phase 2 BUILD → Phase 3 VERIFY → Phase 4 DELIVER
```

### Phase 0 — Discovery (mandatory questions)

Ask in one compact message (use the platform's option/elicitation UI when
available — `ask_user_input_v0` on Claude.ai). If Granola MCP is connected
and the project came from client meetings, first run
`query_granola_meetings("brand colors fonts requirements <project>")` and
pre-fill answers, then confirm them instead of re-asking.

**Q1 · Language & direction** — Arabic (RTL) / English (LTR) / Bilingual
(which is primary?). Sets `<html lang dir>`, lockup order, motion direction.

**Q2 · Brand & logo path** — What is the brand name (exact spelling in each
language)? Then which logo path:
  - **(a) You upload** an existing logo/sketch → I refine + vectorize.
  - **(b) I hand-craft an SVG mark** derived from the name & purpose (§2).
  - **(c) AI-generate via Higgsfield MCP** → vectorize via Adobe MCP (§2.6).

**Q3 · Color palette** — Present the vault (§3.1) as a short vibe table and
offer: pick one family · merge two families · provide your own hexes ·
or *"designer's choice"* (I pick + add my own touches — say so explicitly).
Always ask whether an extra accent color may be added.

**Q4 · Fonts** — Present the font vault (§4) and ask **which font plays which
role**: logo wordmark / headlines / body / UI. Arabic candidates are the
user's uploaded files (Palestine, Rakkas, Al-Jazeera Light·Regular·Bold);
Latin candidates are Noto Serif, Merriweather, + a recommended UI sans
(Inter or Space Grotesk). Offer "designer's choice" here too.

**Q5 · Theme** — Dark only / Light only / **Both with toggle** (which is
default?). Both ⇒ implement §3.5 no-flash toggle.

**Q6 · 3D intensity** — Full Three.js hero (§6) / lightweight canvas-CSS
effects only (§7) / minimal static. Tie to audience devices & perf budget.

**Q7 · Scope** — New build from zero, or redesign of an existing site
(→ get URL or files, run §11 audit first).

**Q8 · Content** — Real copy provided, or should I write it (§9 rules)?

### Phase 0.5 — Write the Project Brief (persistent memory)

Record every decision in a **PROJECT MEMORY** block. This is the claude-mem /
context-engineering pattern: smallest set of high-signal tokens that keeps
every future session consistent. Place it (1) as a comment at the top of the
main file, and (2) in `MEMORY.md` when a filesystem exists. Load it before
any later edit; append after every milestone. Never delete it.

```html
<!-- ══ PROJECT MEMORY · do not delete ════════════════════════════
brand    : قلم (PEN) — writing platform
lang     : ar primary (rtl) · en secondary
palette  : jet-black surfaces + digital-blue primary + crimson-carrot accent (10%)
fonts    : wordmark=Palestine · display=Rakkas · body/ui=Al-Jazeera (L/R/B) · latin=Inter
theme    : dark + light toggle · default dark
logo     : hand-crafted SVG nib mark v2 · interactive · links "/"
effects  : hero = GLSL aurora shader (§6.4) · ambient = grid-glow (§7)
3d       : medium budget — shader plane + 3k particles, no models
decisions: 2026-06-12 client approved palette merge; CTA copy "ابدأ الكتابة"
═══════════════════════════════════════════════════════════════ -->
```

### Phase 1 — Direction (before any code)

State in ≤6 lines: aesthetic thesis (named stance, e.g. *"midnight
editorial-tech"*), the one memorable hook, chosen hero + ambient effect,
type roles, motion personality (calm/snappy/playful). Sanity-check with
DFII: aesthetic impact · context fit · feasibility · performance safety ·
consistency — all must be ≥3/5 or change direction.

### Phase 2 — Build order (always this sequence)

1. Tokens (colors §3.3, type §4.4, motion §5.2, spacing §8) →
2. Document skeleton + theme script in `<head>` →
3. Identity (logo, lockup, nav) →
4. Layout & real content →
5. Motion layer →
6. 3D / effects layer (lazy-init) →
7. States (hover/focus/empty/error/loading) →
8. Polish pass (§8 checklist).

### Phase 3 — Verify

Run §13 gates. If Chrome DevTools MCP is available, run the live loop
(§10.4) until two consecutive clean passes. Otherwise self-audit + ask the
user to confirm console is clean.

### Phase 4 — Deliver

Ship the file(s), a 5-line change log, screenshots when possible, and the
updated PROJECT MEMORY block. No essays.

---

## 2 · IDENTITY ENGINE — Logo & Brand

### 2.1 The three logo paths

| Path | When | Pipeline |
|---|---|---|
| (a) User upload | Logo/sketch exists | Inspect → redraw clean SVG (trace geometry, snap to grid) → tokenize colors to `currentColor` |
| (b) Hand-crafted SVG | Default; full control | §2.2 construction → §2.3 interactivity |
| (c) AI-generated | User wants imagery/3D mark | Higgsfield → Adobe vectorize (§2.6) |

### 2.2 SVG mark construction rules

- Derive meaning from **name + purpose** (قلم/PEN → nib, stroke, ink dot;
  a finance app → ascending stroke; map the metaphor, never decorate idly).
- Build on a **48×48 grid**, snap anchors to whole/half units, 2–8 paths max.
- Single visual logic: all strokes one width (e.g. 3.5) **or** all solid
  fills — never mixed.
- `fill="currentColor"` / `stroke="currentColor"` so the mark inherits theme.
- Must read at 16px (favicon test) and 192px (hero test).
- Optical, not mathematical, centering — nudge until it *looks* centered.
- Export favicon + `<meta>` OG image from the same mark (Higgsfield
  `upscale_image` can produce the 4K OG render).

### 2.3 Interactive logo (click → home) — canonical implementation

```html
<a href="/" class="brand" aria-label="قلم — الصفحة الرئيسية">
  <svg class="brand__mark" viewBox="0 0 48 48" width="34" height="34"
       fill="none" stroke="currentColor" stroke-width="3.5"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M24 6 38 20 24 42 10 20Z"/>      <!-- nib body -->
    <path d="M24 20v10"/>                      <!-- ink channel -->
    <circle cx="24" cy="16" r="1.6" fill="currentColor" stroke="none"/>
  </svg>
  <span class="brand__name">قلم</span>
</a>
```

```css
.brand{display:inline-flex;align-items:center;gap:.6rem;color:var(--text);
  text-decoration:none;-webkit-tap-highlight-color:transparent}
.brand__mark{transition:transform .45s var(--ease-spring),color .3s}
.brand:hover .brand__mark{transform:rotate(-8deg) scale(1.08);color:var(--accent)}
.brand:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:8px}
.brand.is-pressed .brand__mark{animation:brandPop .28s var(--ease-spring)}
@keyframes brandPop{40%{transform:scale(.82) rotate(6deg)}}
@media (prefers-reduced-motion:reduce){.brand__mark{transition:none}}
```

```js
// Press feedback, then navigate. NEVER delay navigation > 300ms.
document.querySelectorAll('a.brand').forEach(a => {
  a.addEventListener('click', e => {
    const inPage = (a.getAttribute('href') || '').startsWith('#');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;                       // instant nav, no theatrics
    a.classList.add('is-pressed');
    if (!inPage) {
      e.preventDefault();
      setTimeout(() => location.assign(a.href), 240);
    } else {
      e.preventDefault();
      document.querySelector(a.hash || 'body')
        ?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => a.classList.remove('is-pressed'), 300);
    }
  });
});
```

On a one-page site, `href="#top"` + smooth scroll counts as "home".
In React: same markup as a component; replace `location.assign` with the
router's `navigate('/')`.

### 2.4 Lockup & RTL/LTR rules

- Markup order is always **mark → name**; flex + `dir` handles visual order
  (RTL automatically places the mark at the right edge). Never hard-code
  left/right — use logical properties (`margin-inline-start`, `inset-inline`).
- Arabic site ⇒ Arabic wordmark beside the mark; English site ⇒ English
  wordmark. Bilingual ⇒ primary language in the lockup, secondary in footer.
- Wordmark font = the role chosen in Q4 (Palestine or Rakkas shine here);
  size it to the mark's cap height, gap = 0.5–0.7× mark width.
- The mark itself must NOT be mirrored in RTL unless it contains directional
  meaning (arrows, pen tips pointing into reading direction — then flip with
  `[dir=rtl] .brand__mark{transform:scaleX(-1)}` and re-check hover compose).

### 2.5 Wordmark reveal animations (pick ONE)

**⚠ Arabic law: never split Arabic into per-letter spans** — it destroys
joining/ligatures. Letter-stagger is Latin-only; Arabic gets word-level
stagger or a clip-wipe.

**A · Ink Rise (letter stagger — Latin only)**

```js
function staggerLatin(el){
  if (/[\u0600-\u06FF]/.test(el.textContent)) return;   // guard Arabic
  el.setAttribute('aria-label', el.textContent);
  el.innerHTML = [...el.textContent].map((c, i) =>
    `<span aria-hidden="true" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
}
staggerLatin(document.querySelector('.brand__name'));
```
```css
.brand__name span{display:inline-block;opacity:0;transform:translateY(.55em);
  filter:blur(6px);animation:riseIn .7s var(--ease-out) forwards;
  animation-delay:calc(120ms + var(--i)*55ms)}
@keyframes riseIn{to{opacity:1;transform:none;filter:blur(0)}}
```

**B · Clip Wipe (Arabic-safe, direction-aware)**

```css
.brand__name{display:inline-block;clip-path:inset(0 100% 0 0);
  animation:wipe .8s var(--ease-out) .15s forwards}
[dir="rtl"] .brand__name{clip-path:inset(0 0 0 100%)}   /* reveal right→left */
@keyframes wipe{to{clip-path:inset(0 0 0 0)}}
```

**C · Calligraphic Draw (SVG wordmark)** — convert the wordmark text to
outlined paths (preserves Arabic shaping), then:

```css
.wordmark path{stroke-dasharray:1;stroke-dashoffset:1;fill-opacity:0;
  animation:draw 1.2s var(--ease-in-out) forwards, inkFill .4s 1s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes inkFill{to{fill-opacity:1}}
```
(Set `pathLength="1"` on each `<path>`.) Reduced-motion: all three variants
collapse to a simple ≤150ms opacity fade — wire via the §5.5 contract.

### 2.6 AI logo pipeline (Higgsfield → Adobe)

When the user picks path (c), and these MCPs are connected:

1. `models_explore(type:'image')` → prefer `nano_banana_pro` (clean
   vector-look, text fidelity, 4K) or `marketing_studio_image` for
   brand-system boards.
2. `generate_image` — prompt formula:
   *"minimal flat vector logomark for «brand», «metaphor», geometric, single
   stroke weight, centered on plain white background, no text, no gradients"*.
   Generate `count:4`, let the user pick.
3. `remove_background(media_id, media_type:'image')`.
4. Adobe `image_vectorize` → SVG → hand-clean in code: merge paths, snap to
   the 48-grid, swap fills to `currentColor`, then apply §2.3 interactivity.
5. Optional: `upscale_image(resolution:'4k')` for the OG/social image;
   Higgsfield `generate_video` for an animated logo sting.

If the MCPs aren't connected: say so, offer path (b), or give the user the
exact prompts to run themselves.

---

## 3 · COLOR SYSTEM

### 3.1 Palette vault (user-approved families, 50→950)

```
blue           50 #ece5ff · 100 #d9ccff · 200 #b399ff · 300 #8c66ff · 400 #6633ff · 500 #4000ff · 600 #3300cc · 700 #260099 · 800 #1a0066 · 900 #0d0033 · 950 #090024
fern           50 #f0f5f0 · 100 #e1eae1 · 200 #c3d6c2 · 300 #a4c1a4 · 400 #86ac86 · 500 #689867 · 600 #537953 · 700 #3e5b3e · 800 #2a3d29 · 900 #151e15 · 950 #0f150e
prussian-blue  50 #eeeff6 · 100 #dde0ee · 200 #bbc1dd · 300 #99a2cc · 400 #7783bb · 500 #5563aa · 600 #445088 · 700 #333c66 · 800 #222844 · 900 #111422 · 950 #0c0e18
azure*         50 #e5f3ff · 100 #cce6ff · 200 #99ceff · 300 #66b5ff · 400 #339cff · 500 #0084ff · 600 #0069cc · 700 #004f99 · 800 #003566 · 900 #001a33 · 950 #001224
digital-blue   50 #e5f0ff · 100 #cce0ff · 200 #99c2ff · 300 #66a3ff · 400 #3385ff · 500 #0066ff · 600 #0052cc · 700 #003d99 · 800 #002966 · 900 #001433 · 950 #000e24
jet-black      50 #f0f1f5 · 100 #e1e2ea · 200 #c2c6d6 · 300 #a4a9c1 · 400 #868dac · 500 #677098 · 600 #535a79 · 700 #3e435b · 800 #292d3d · 900 #15161e · 950 #0e1015
ash-grey       50 #f2f4f1 · 100 #e5e9e2 · 200 #cad3c5 · 300 #b0bca9 · 400 #96a68c · 500 #7c906f · 600 #637359 · 700 #4a5643 · 800 #313a2c · 900 #191d16 · 950 #111410
crimson-carrot 50 #ffece6 · 100 #fedacd · 200 #fdb59b · 300 #fd9068 · 400 #fc6b36 · 500 #fb4604 · 600 #c93803 · 700 #972a02 · 800 #641c02 · 900 #320e01 · 950 #230a01
```
\* `prussian-blue1` and `pale-sky` in the user's source are byte-identical —
treat them as one family, **azure**. Mention this when presenting options.

**Vibe guide (use when asking Q3):**

| Family | Personality | Best as |
|---|---|---|
| blue | electric ultraviolet, futuristic | primary on dark tech sites |
| fern | calm, organic, trustworthy | nature / wellness / education |
| prussian-blue | muted indigo, corporate quiet | dashboards, B2B |
| azure | vivid sky, friendly tech | consumer apps, light themes |
| digital-blue | classic confident tech | SaaS primaries, links |
| jet-black | blue-tinted neutral | dark surfaces & text scale |
| ash-grey | warm sage neutral | light surfaces, organic pairings |
| crimson-carrot | fiery energy | accent ONLY (≤10% of UI) |

**Proven recipes (offer as merge options):**
*Midnight Tech* jet-black surfaces + digital-blue primary + crimson-carrot
accent · *Electric Violet* blue on jet-black-950 · *Organic Calm* fern +
ash-grey, light-first · *Editorial Azure* azure + jet-black text,
light-first · *Ember* jet-black + crimson-carrot primary (bold, rare).

### 3.2 Selection protocol

Present vibe table → user picks / merges / supplies hexes / delegates.
If delegated, name your choice + reasoning in one line and proceed. Ask once
whether you may add micro-touches (tinted shadows, gradient seams) — then
stop asking.

### 3.3 Semantic tokens (the only colors the code may use)

Components never reference raw family stops — only semantic tokens:

```css
:root{ /* light */
  --bg:#f7f8fb; --surface:#ffffff; --surface-2:var(--jet-50);
  --text:var(--jet-900); --text-muted:var(--jet-600);
  --border:color-mix(in oklab, var(--jet-900) 12%, transparent);
  --primary:var(--digital-600); --primary-contrast:#fff;
  --accent:var(--carrot-500); --ring:var(--digital-500);
  --grid-line:color-mix(in oklab, var(--jet-900) 7%, transparent);
  color-scheme:light;
}
:root[data-theme="dark"]{
  --bg:var(--jet-950); --surface:var(--jet-900); --surface-2:var(--jet-800);
  --text:var(--jet-50); --text-muted:var(--jet-300);
  --border:color-mix(in oklab, #fff 12%, transparent);
  --primary:var(--digital-400); --primary-contrast:var(--jet-950);
  --accent:var(--carrot-400); --ring:var(--digital-300);
  --grid-line:color-mix(in oklab, #fff 6%, transparent);
  color-scheme:dark;
}
```
(Define the chosen families as `--jet-50…950` etc. above this block.)

### 3.4 Usage & contrast laws

- **60/30/10**: 60% bg/neutrals · 30% surfaces/secondary · ≤10% accent.
- Body text ≥ **4.5:1**, large text/icons ≥ **3:1** (WCAG AA). Quick map:
  on `950` backgrounds use `50–200` for text, `300–400` for muted (verify
  muted ≥4.5 if body-size); on `50` backgrounds use `900–950` text,
  `600–700` muted. Never `400/500` body text on white.
- Links/buttons in dark mode: shift primary **up** the scale (500→400) to
  keep contrast; do the reverse in light mode.
- Gradients: only between adjacent-feel stops (e.g. digital-500→blue-500),
  never across temperature clashes; max one gradient per viewport.
- Crimson-carrot is salt, not soup: CTAs, live badges, one hero glyph.

### 3.5 Dark/Light implementation (no-flash)

Inline **in `<head>` before CSS** (prevents wrong-theme flash):

```html
<script>
(function(){try{
  var t = localStorage.getItem('theme')
       || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
  document.documentElement.dataset.theme = t;
}catch(e){ document.documentElement.dataset.theme = 'dark'; }})();
</script>
```

Toggle:

```js
function setTheme(t){
  document.documentElement.dataset.theme = t;
  try{ localStorage.setItem('theme', t); }catch(e){}   // artifacts: memory only
}
toggleBtn.onclick = () =>
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
```

Rules: animate the switch with a 250ms `background-color,color` transition
on `:root` only (add a `.theming` class for the duration, remove after —
permanent global transitions cause jank); icon = sun/moon morph; persist
choice; **in Claude.ai artifact previews `localStorage` is unavailable** —
the `try/catch` above degrades to in-memory, keep it.

---

## 4 · TYPOGRAPHY SYSTEM

### 4.1 Arabic vault (user's uploaded files)

| File | Role | Laws |
|---|---|---|
| `Palestine-Regular.otf` | Brand wordmark · expressive accents · pull quotes | Single weight, calligraphic — never body, never <28px |
| `Rakkas-Regular.ttf` | Display headlines · hero numerals | Ruqʿah-flavored display; ≥32px; one per viewport |
| `AL-JAZEERA-ARABIC-LIGHT.TTF` | Large quiet text, sub-heads | The workhorse trio — body 16–18px, |
| `AL-JAZEERA-ARABIC-REGULAR.TTF` | Body & UI default | Regular for body, Bold for headings/buttons, |
| `AL-JAZEERA-ARABIC-BOLD.TTF` | Headings · buttons · emphasis | Light only ≥20px |

### 4.2 Latin library

Noto Serif (editorial headings/serif body) · Merriweather (long-form body)
— both via Google Fonts. Recommend pairing a UI sans (**Inter** or
**Space Grotesk**) for buttons/labels; serif+sans split keeps hierarchy.
Bilingual rule: pick the Latin face whose x-height/weight visually matches
the Arabic body (Inter ↔ Al-Jazeera Regular is a proven match).

### 4.3 Ask-first protocol (Q4 script)

Offer a role table and let the user assign: *wordmark / display / body /
UI*. Default proposal if delegated: **Palestine = wordmark, Rakkas =
display, Al-Jazeera = body+UI (3 weights), Inter = Latin companion**.
Never load a font that has no assigned role.

### 4.4 Loading — @font-face done right

Convert + subset first (preserve Arabic shaping features!):

```bash
pip install fonttools brotli
pyftsubset AL-JAZEERA-ARABIC-REGULAR.TTF --flavor=woff2 \
  --unicodes="U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669,U+0020-007E,U+060C,U+061B,U+061F" \
  --layout-features='*' --output-file=fonts/aljazeera-r.woff2
```
`--layout-features='*'` is **mandatory** — dropping it strips init/medi/fina
joining and breaks Arabic rendering.

```css
@font-face{font-family:"Al Jazeera";src:url(fonts/aljazeera-r.woff2) format("woff2");
  font-weight:400;font-display:swap;unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF;}
/* repeat for 300/700, Palestine, Rakkas */
:root{
  --font-ar:"Al Jazeera","Noto Naskh Arabic",system-ui,sans-serif;
  --font-display:"Rakkas",var(--font-ar);
  --font-brand:"Palestine",var(--font-display);
  --font-latin:"Inter","Noto Serif",Georgia,serif;
  font-family:var(--font-ar);
}
```
- `unicode-range` lets the Latin face automatically render embedded Latin
  inside Arabic text — list both families: `font-family:var(--font-latin),var(--font-ar)` on bilingual nodes.
- True single-file delivery: base64-embed (`base64 -w0 f.woff2`) into the
  `src:url(data:font/woff2;base64,…)` — only after subsetting (size!).
- Gate intro animations on `document.fonts.ready` to avoid FOUT reflow jumps.

### 4.5 Scale & Arabic typographic laws

```css
:root{
  --step--1:clamp(.83rem,.8rem+.18vw,.95rem);
  --step-0:clamp(1rem,.94rem+.3vw,1.166rem);      /* body */
  --step-1:clamp(1.25rem,1.13rem+.6vw,1.6rem);
  --step-2:clamp(1.56rem,1.3rem+1.3vw,2.3rem);
  --step-3:clamp(1.95rem,1.5rem+2.3vw,3.2rem);
  --step-4:clamp(2.44rem,1.7rem+3.7vw,4.6rem);    /* hero */
}
```
- Arabic body line-height **1.7–1.9** (Latin 1.5–1.6); headings 1.25–1.4.
- **Never letter-spacing on Arabic.** Not even 0.01em. Latin caps may track.
- No faux bold/italic — load real weights; Arabic has no italic: use color,
  weight, or size for emphasis instead.
- Arabic often reads ~5–8% smaller than Latin at equal px — bump Arabic body
  to 17–18px when Latin is 16px for parity.
- Digits: pick Arabic-Indic (٠١٢) or Latin (012) once, sitewide
  (`font-variant-numeric` + content discipline).
- Mixed-direction fragments: wrap with `<bdi>`; punctuation must be Arabic
  (`،` `؟` `؛`) in Arabic copy.
- Max 2 text faces per script + 1 display accent. 65–75ch measure
  (Arabic ~60ch).

---

## 5 · MOTION SYSTEM

### 5.1 Taste laws (Emil Kowalski, distilled)

1. Great animation is **invisible** — it explains, orients, or confirms;
   it never performs.
2. **Frequency law**: the more often an interaction happens, the faster and
   subtler its animation. Daily-use UI ≈ 150–250ms; first-visit hero may
   take 600–900ms.
3. Enter = **ease-out**. Exit = ease-in, ~0.8× the enter duration. Move =
   ease-in-out. **Linear only for infinite loops** (marquee, spinner).
4. Animate **transform / opacity / filter / clip-path only** (compositor).
   Never width/height/top/left/margin. `will-change` sparingly, remove after.
5. **Origin-aware**: things grow from where they're triggered
   (`transform-origin` at the trigger point).
6. **Interruptible**: prefer springs/WAAPI/CSS transitions that retarget
   mid-flight; never lock the UI waiting for an animation.
7. Stagger 40–80ms per item, total choreography ≤700ms.
8. Taste = subtraction: remove animations until it hurts, add one back.

### 5.2 Motion tokens

```css
:root{
  --dur-1:120ms; --dur-2:200ms; --dur-3:320ms; --dur-4:600ms; --dur-5:900ms;
  --ease-out:cubic-bezier(.22,1,.36,1);
  --ease-in:cubic-bezier(.64,0,.78,0);
  --ease-in-out:cubic-bezier(.65,0,.35,1);
  --ease-spring:cubic-bezier(.34,1.56,.64,1);   /* CSS spring feel */
}
```
Motion-for-React spring presets: snappy `{type:"spring",stiffness:380,damping:32}` ·
gentle `{stiffness:200,damping:26}` · bouncy `{stiffness:300,damping:18,mass:.9}`.

### 5.3 Tool ladder (use the lowest rung that works)

CSS transitions/keyframes → Web Animations API → **Motion** (motion.dev;
React: `import {motion, AnimatePresence} from "motion/react"`, vanilla:
`import {animate, scroll, inView} from "motion"`) → **GSAP + ScrollTrigger**
only for multi-actor timelines / scrubbed scenes → **View Transitions API**
for page/theme transitions (`document.startViewTransition(cb)` +
`@view-transition{navigation:auto}` for MPA; always feature-detect).

### 5.4 Recipe box

**Entrance choreography** (order is meaning): bg/effect fades → logo pops →
headline reveals (§2.5) → sub + CTA rise → ambient starts. Implement with
animation-delays or a Motion `staggerChildren` variant.

```jsx
const wrap={hidden:{},show:{transition:{staggerChildren:.07,delayChildren:.15}}};
const item={hidden:{opacity:0,y:24,filter:"blur(6px)"},
            show:{opacity:1,y:0,filter:"blur(0px)",
                  transition:{type:"spring",stiffness:200,damping:26}}};
<motion.section variants={wrap} initial="hidden" animate="show">
  <motion.h1 variants={item}>…</motion.h1>
  <motion.p  variants={item}>…</motion.p>
</motion.section>
```

**Scroll reveal (vanilla, the default):**

```js
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
}),{threshold:.18,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
```
```css
[data-reveal]{opacity:0;translate:0 26px;transition:opacity .7s var(--ease-out),translate .7s var(--ease-out)}
[data-reveal].in{opacity:1;translate:0 0}
[dir="rtl"] [data-reveal="side"]{translate:32px 0}   /* mirror lateral motion */
[dir="ltr"] [data-reveal="side"]{translate:-32px 0}
```

**Magnetic button** (pointer devices only):

```js
if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches)
btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();
  btn.style.translate=`${(e.clientX-r.x-r.width/2)*.22}px ${(e.clientY-r.y-r.height/2)*.22}px`;});
btn.addEventListener('pointerleave',()=>btn.style.translate='0 0');
// CSS: .btn{transition:translate .35s var(--ease-spring)}
```

**Tilt card**: same pattern → `rotateX/rotateY ±7deg`, `perspective:800px`
on parent, reset on leave. **Marquee**: duplicate track, `translateX(-50%)`
keyframe, linear, pause on hover. **Count-up**: rAF + ease-out on
IntersectionObserver, `Intl.NumberFormat('ar')` for Arabic numerals.

### 5.5 Reduced-motion contract (non-negotiable)

```css
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;
    animation-iteration-count:1!important;transition-duration:.01ms!important;
    scroll-behavior:auto!important}
}
```
Plus JS guards (`matchMedia`) around parallax, magnetic, smooth-scroll,
autoplaying 3D — swap to static poster/fade. Test this path explicitly (§13).

---

## 6 · THREE.JS ENGINE

The deep layer. Pick the **lightest technique that achieves the vision** —
shader plane < particles < loaded GLB < skinned character.

### 6.0 Canonical boilerplate (every scene starts here)

```html
<canvas id="gl" aria-hidden="true"></canvas>
<script type="importmap">
{"imports":{
  "three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
  "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"
}}
</script>
<script type="module">
import * as THREE from 'three';

const canvas   = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true,
                  powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));      // DPR clamp
renderer.outputColorSpace = THREE.SRGBColorSpace;            // correct color
renderer.toneMapping      = THREE.ACESFilmicToneMapping;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
camera.position.set(0, 0, 6);

const clock = new THREE.Clock();
let raf = 0, visible = false;

function tick(){
  const dt = Math.min(clock.getDelta(), .05);   // clamp tab-return spikes
  update(dt, clock.elapsedTime);                // your per-frame logic
  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}
function resize(){
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);

/* run ONLY when on screen + tab visible — battery & perf law */
new IntersectionObserver(([e])=>{
  visible = e.isIntersecting;
  cancelAnimationFrame(raf);
  if (visible){ clock.getDelta(); raf = requestAnimationFrame(tick); }
}).observe(canvas);
document.addEventListener('visibilitychange', ()=>{
  cancelAnimationFrame(raf);
  if (!document.hidden && visible) raf = requestAnimationFrame(tick);
});

function dispose(){            // call on teardown / SPA unmount
  cancelAnimationFrame(raf);
  scene.traverse(o=>{ o.geometry?.dispose();
    [].concat(o.material||[]).forEach(m=>{ 
      Object.values(m).forEach(v=>v?.isTexture && v.dispose()); m.dispose?.(); });});
  renderer.dispose();
}
</script>
```

### 6.1 Keyframe & clip playback (GLB from Blender)

```js
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

const draco = new DRACOLoader()
  .setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/');
const gltf  = await new GLTFLoader().setDRACOLoader(draco).loadAsync('model.glb');
scene.add(gltf.scene);

const mixer   = new THREE.AnimationMixer(gltf.scene);
const actions = Object.fromEntries(gltf.animations.map(c=>[c.name, mixer.clipAction(c)]));
let current   = actions.Idle; current.play();

function fadeTo(name, d = .4){                 // blend Walk/Jump/Idle…
  const next = actions[name]; if (!next || next === current) return;
  next.reset().setEffectiveTimeScale(1).fadeIn(d).play();
  current.crossFadeTo(next, d, false); current = next;
}
// inside update(dt):  mixer.update(dt);
```
KeyframeTrack/AnimationClip can also be authored in code:
`new THREE.AnimationClip('pulse', 2, [new THREE.VectorKeyframeTrack('.scale',[0,1,2],[1,1,1, 1.15,1.15,1.15, 1,1,1])])`.

### 6.2 Skeletal · bones · IK

```js
const head = gltf.scene.getObjectByName('Head');        // THREE.Bone
// pointer look-at (cheap rig): smooth-damp Euler targets in update():
head.rotation.y = THREE.MathUtils.damp(head.rotation.y, mouse.x*.5, 4, dt);
head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -mouse.y*.3, 4, dt);
```
- SkinnedMesh + Skeleton arrive ready inside the GLB; transform parents,
  children follow.
- Full IK (hand-reaches-target): `import {CCDIKSolver} from
  'three/addons/animation/CCDIKSolver.js'` — define `{target, effector,
  links[]}` bone indices, call `solver.update()` per frame. Use for
  characters/robot arms only; the damp-look-at covers 90% of hero needs.

### 6.3 Morph targets (faces, blobs, shapeshifts)

```js
const face = gltf.scene.getObjectByName('Face');
const i = face.morphTargetDictionary['smile'];          // name → index
// update():
face.morphTargetInfluences[i] =
  THREE.MathUtils.damp(face.morphTargetInfluences[i], hover ? 1 : 0, 6, dt);
```
Blend several targets (0–1 each) for expressions/visemes; drive from
scroll progress for organic section transitions.

### 6.4 GLSL ShaderMaterial — the signature aurora background

Full-screen shader plane: millions of "particles of light" for the price of
one quad. Colors come from the chosen palette via uniforms.

```js
const uniforms = {
  uTime:{value:0}, uAspect:{value:1}, uMouse:{value:new THREE.Vector2()},
  uA:{value:new THREE.Color('#0e1015')},   // jet-950  (bg)
  uB:{value:new THREE.Color('#0066ff')},   // digital-500
  uC:{value:new THREE.Color('#8c66ff')},   // blue-300 glow
};
const mat = new THREE.ShaderMaterial({
  uniforms, depthWrite:false,
  vertexShader:/* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader:/* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform float uTime, uAspect; uniform vec2 uMouse; uniform vec3 uA,uB,uC;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                 mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
    float fbm(vec2 p){ float v=0., a=.5;
      for(int k=0;k<5;k++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }
    void main(){
      vec2 uv = vUv; uv.x *= uAspect;
      float t = uTime*.05;
      vec2 drift = vec2(fbm(uv*1.6+t), fbm(uv*1.6-t));
      float field = fbm(uv*2.2 + drift*1.5 + uMouse*.12);
      vec3 col = mix(uA, uB, smoothstep(.30,.85,field));
      col = mix(col, uC, fbm(uv*3.5 - t)*.40);
      col *= .45 + .55*smoothstep(1.2,.2,length(vUv-.5)*1.7);   // vignette
      gl_FragColor = vec4(col, 1.);
    }`
});
const ortho = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat));
// update(): uniforms.uTime.value = t;  uniforms.uAspect.value = w/h;
// pointermove: lerp uMouse toward normalized (-1..1) coords.
// render with `ortho` instead of the perspective camera for this scene.
```
Uniform discipline: JS loop writes **only** uniform values — never rebuild
materials per frame. Vertex-shader variant: displace a subdivided plane's
`position.z` by the same fbm for silk/ocean ribbons.

### 6.5 Procedural & physics motion

```js
// idle float (every hero object gets one — nothing is frozen):
mesh.position.y = Math.sin(t*.8)*.15;
mesh.rotation.z = Math.sin(t*.5)*.04;
// frame-rate-independent chase (NEVER lerp by a constant):
camera.position.x = THREE.MathUtils.damp(camera.position.x, mouse.x*.6, 3, dt);
camera.position.y = THREE.MathUtils.damp(camera.position.y, mouse.y*.35, 3, dt);
camera.lookAt(0,0,0);
```
Real physics (rigid bodies, collisions): **Rapier** (`@dimforge/rapier3d-compat`)
— step `world.step()` in update, copy body translations/rotations onto
meshes. Use only when interaction demands it; springs + damp fake 90% of
"physical" feel for free.

### 6.6 Particles & instancing

```js
const N = innerWidth < 768 ? 1200 : 3500;
const pos = new Float32Array(N*3);
for (let i=0;i<N;i++) pos.set(
  [(Math.random()-.5)*14, (Math.random()-.5)*8, (Math.random()-.5)*6], i*3);
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
const pts = new THREE.Points(geo, new THREE.PointsMaterial({
  size:.035, color:0x66a3ff, transparent:true, opacity:.85,
  blending:THREE.AdditiveBlending, depthWrite:false }));
scene.add(pts);
// update(): pts.rotation.y = t*.02;  // slow galaxy drift
```
Thousands of *meshes* → `InstancedMesh` + `setMatrixAt` (+
`instanceMatrix.needsUpdate = true`). Per-particle motion at huge counts →
move it into the vertex shader (§6.4) with an `aOffset` attribute.

### 6.7 Postprocessing (one effect, subtle)

```js
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass}     from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(1,1), .35, .8, .85));
// replace renderer.render(...) with composer.render(); resize → composer.setSize(w,h)
```
Bloom threshold ≥.85 so only emissives glow. Skip composer entirely on
mobile (render direct).

### 6.8 Performance budget & fallback ladder

| Budget | Desktop | Mobile |
|---|---|---|
| FPS target | 60 | 60 (degrade features, not fps) |
| DPR | ≤2 | ≤1.5 |
| Triangles | <300k | <100k |
| Points | ≤60k | ≤15k |
| Lights w/ shadow | 1 | 0 |
| Postprocessing | bloom only | none |
| Textures | ≤2048px, compressed | ≤1024px |

Ladder: WebGL unavailable / `prefers-reduced-motion` / low-end signal
(`navigator.hardwareConcurrency<4`) → swap canvas for the CSS aurora (§7)
or a static gradient poster. Always lazy-init the scene on first
intersection, never on parse.

### 6.9 React projects

Use `@react-three/fiber` + `@react-three/drei` (`<Canvas dpr={[1,2]}>`,
`useFrame((s,dt)=>…)`, `<Float>`, `<Environment>`); identical budgets and
dispose discipline (R3F disposes on unmount automatically).

---

## 7 · EFFECTS LIBRARY (21st.dev-grade, original implementations)

Selection law: **1 hero + 1 ambient max** (§0.8). All effects read colors
from semantic tokens; all respect §5.5.

### 7.1 Masked dot grid (ambient)

```css
.dots{position:absolute;inset:0;
  background-image:radial-gradient(var(--grid-line) 1.2px, transparent 1.2px);
  background-size:24px 24px;
  -webkit-mask-image:radial-gradient(ellipse 65% 55% at 50% 38%, #000 25%, transparent 72%);
  mask-image:radial-gradient(ellipse 65% 55% at 50% 38%, #000 25%, transparent 72%);}
.dots::after{content:"";position:absolute;inset:0;   /* tinted bloom */
  background:radial-gradient(40% 35% at 50% 32%,
    color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%);}
```

### 7.2 Grid glow (ambient, pointer-reactive)

```css
.grid{position:relative;
  background-image:linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size:48px 48px;}
.grid::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(260px circle at var(--mx,50%) var(--my,40%),
    color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%);}
```
```js
let raf; grid.addEventListener('pointermove', e=>{
  const r = grid.getBoundingClientRect();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(()=>{ 
    grid.style.setProperty('--mx', e.clientX - r.left + 'px');
    grid.style.setProperty('--my', e.clientY - r.top  + 'px'); });
});
```

### 7.3 Aurora (CSS variant — the §6.8 fallback and light-budget hero)

```css
.aurora{position:absolute;inset:-20%;filter:blur(64px);opacity:.5;
  pointer-events:none;background:
  radial-gradient(35% 45% at 22% 30%, var(--primary), transparent 70%),
  radial-gradient(40% 50% at 78% 24%, color-mix(in oklab, var(--accent) 60%, transparent), transparent 70%),
  radial-gradient(45% 55% at 50% 82%, color-mix(in oklab, var(--primary) 45%, transparent), transparent 72%);
  animation:aurora 18s var(--ease-in-out) infinite alternate;}
@keyframes aurora{to{transform:rotate(7deg) scale(1.12) translateY(-4%)}}
```

### 7.4 Particle field — 2D canvas (when Three.js is overkill)

Spawn 60–120 dots, drift slowly, connect pairs <110px with fading lines,
repel within 90px of pointer. One rAF loop, `clearRect` per frame, colors
from `--primary` at 25–60% alpha, DPR-aware sizing. (Full Points version:
§6.6.)

### 7.5 Cursor tube trail (signature touch — pointer devices only)

```js
const c = document.getElementById('trail'); const x = c.getContext('2d');
function fit(){ c.width = innerWidth; c.height = innerHeight; }
fit(); addEventListener('resize', fit);
let m = {x:innerWidth/2, y:innerHeight/2}, p = {...m}, pts = [];
addEventListener('pointermove', e => m = {x:e.clientX, y:e.clientY});
(function loop(){
  p.x += (m.x-p.x)*.3; p.y += (m.y-p.y)*.3;       // smoothed head
  pts.unshift({...p}); if (pts.length > 26) pts.pop();
  x.clearRect(0,0,c.width,c.height);
  x.globalCompositeOperation = 'lighter';
  pts.forEach((q,i)=>{ const k = 1 - i/pts.length;
    x.beginPath(); x.arc(q.x, q.y, 13*k, 0, 7);
    x.fillStyle = `hsl(216 100% 60% / ${.09*k})`; x.fill(); });
  requestAnimationFrame(loop);
})();
```
`#trail{position:fixed;inset:0;pointer-events:none;z-index:9999}` — mount
only when `(hover:hover)` and motion allowed; keep the native cursor.

### 7.6 Loaders (pick one, brand it)

```css
/* A · conic ring */
.loader{width:44px;aspect-ratio:1;border-radius:50%;
  background:conic-gradient(from 0deg, transparent 8%, var(--primary));
  -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));
          mask:radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));
  animation:spin .9s linear infinite}
@keyframes spin{to{transform:rotate(1turn)}}
```
B · **logo-draw**: the §2.3 mark with `pathLength="1"` +
`stroke-dasharray:1; animation: draw 1.1s ease-in-out infinite alternate`.
C · three dots scale-pulsing with 120ms stagger. Loaders only for >400ms
waits; otherwise skeletons (§8).

### 7.7 Icon system

- Library: **lucide** (stroke icons) — one weight (1.75–2), one grid (24),
  `stroke="currentColor"` everywhere.
- Custom icons follow the logo's geometry language (§2.2) so the set feels
  authored, not assembled (21st.dev icon-set principle).
- Icon-only buttons require `aria-label`; hover may animate stroke
  (`stroke-dashoffset`) or 1.06 scale — pick one sitewide.

---

## 8 · LAYOUT, UI & ACCESSIBILITY STANDARDS

**Structure** — 4/8px spacing grid only. Containers ≤1200–1280px,
24px gutters mobile. Section rhythm 96–160px desktop / 64–96px mobile.
Hero: one focal point, 45–60% breathing space, CTA above the fold.
12-col mental grid; intentional asymmetry beats centered-everything.

**Surfaces** — Radius scale 8/12/16/24; nested rule: inner radius = outer −
gap. Shadows: 2-layer (tight + soft), tinted toward the bg hue, stronger in
light mode, near-invisible in dark (use borders + glow instead).
Glass recipe (only over imagery/3D, never glass-on-glass):
`background:color-mix(in oklab, var(--surface) 55%, transparent);
backdrop-filter:blur(16px) saturate(1.4); border:1px solid
color-mix(in oklab,#fff 14%,transparent)`.

**Interactive** — Every control ships 5 states: default / hover / active /
focus-visible / disabled (+ loading for async). `:focus-visible` ring:
2px `var(--ring)`, 3px offset. Touch targets ≥44×44. `cursor:pointer` on
clickables. Buttons disable during async + show spinner inline.

**Content states** — Every data view ships empty, loading (skeletons, not
spinners), and error states. Reserve media dimensions (`width/height` or
`aspect-ratio`) — zero CLS. `loading="lazy"` below the fold.

**Forms** — `<label for>` always; inline validation on blur; error text
adjacent to the field + `aria-describedby`; never color-only signals.

**A11y floor** — semantic landmarks (`header/nav/main/footer`), one `<h1>`,
logical heading ladder, alt text that describes meaning, keyboard order =
visual order, skip-link, `lang`+`dir` correct on `<html>` and any
mixed-language island, contrast per §3.4.

**Impeccable bans** — no layout shift, no scroll-jacking, no autoplaying
sound, no hover-only critical info, no `outline:none` without replacement,
no text in images, no fake buttons (`div onclick`), no orphan `h*` skips.

---

## 9 · COPY & CONTENT (anti-slop · caveman · Karpathy)

Write copy yourself only when Q8 says so — then obey:

1. **Cut filler.** No throat-clearing ("Here's the thing", "It's worth
   noting"), no emphasis crutches ("Full stop", "Let that sink in"),
   no -ly adverbs, no business jargon (unlock / elevate / empower /
   seamless / cutting-edge / game-changer / navigate / journey).
2. **Specifics beat claims.** "ينشر مقالك في ٣ ثوانٍ" > "سريع وقوي".
   Numbers, nouns, outcomes. No vague declaratives ("the implications are
   significant" — name them or delete).
3. **Active voice, human subject.** No "the experience becomes…" — say who
   does what. Put the reader in the room: "you" / "أنت".
4. **Density** (caveman): every sentence earns its bytes. One idea per
   sentence. Two items beat three. If it sounds like a pull-quote, rewrite.
5. **Structure**: headline ≤7 words (Arabic ≤6) — promise or provoke.
   Subhead = the mechanism. CTA = verb + outcome ("ابدأ الكتابة مجانًا",
   "Ship your first page"). Microcopy is human ("نسيت كلمة السر؟").
6. **Arabic is authored, not translated.** Write natively in warm MSA;
   Arabic punctuation (، ؟ ؛); choose digit style per §4.5; never
   machine-translate the Latin draft.
7. Self-score (stop-slop): directness · rhythm · trust · authenticity ·
   density, 1–10 each. Below 35/50 → revise before shipping.

---

## 10 · TOOLBELT — MCP & PLUGIN INTEGRATIONS

Use what is connected; degrade gracefully when not. Name the tool before
first use in a project; for consumer MCP apps follow the platform's
suggest/confirm flow unless the user already named the service.

| Tool | Job in this skill | Key calls |
|---|---|---|
| **Higgsfield** | Logo/brand imagery (§2.6), OG images, hero textures, promo video, upscales | `models_explore` → `generate_image` → `remove_background` / `upscale_image` / `generate_video` |
| **Adobe** | Vectorize AI logos to SVG, batch-edit photos, social crops | `image_vectorize`, `image_crop_and_resize`, `image_remove_background` |
| **Granola** | Pull brand requirements/decisions from client meetings into Phase 0 | `query_granola_meetings`, `get_meeting_transcript` |
| **Perplexity** | Live research: competitor scans, design-trend checks, library versions | `perplexity_ask` (config below) |
| **Chrome DevTools** | The §13 verification loop — real browser, real console | config below |
| **Figma / Canva** | Push final tokens/screens to design tools; social variants | `use_figma` (+ figma-use skill), Canva generate/export |
| **Notion** | Publish the Project Brief / guidelines page | `notion-create-pages` |
| **Bright Data / web tools** | Redesign audits: fetch + inventory existing sites (§11) | scrape → markdown |

**Perplexity MCP** — Claude Code / desktop config (verify package name at
docs.perplexity.ai/docs/getting-started/integrations/mcp-server):

```json
{"mcpServers":{"perplexity":{
  "command":"npx","args":["-y","server-perplexity-ask"],
  "env":{"PERPLEXITY_API_KEY":"<key>"}}}}
```
(Hosted alternative: remote MCP at `https://mcp.perplexity.ai/mcp`.)

**Chrome DevTools MCP** (github.com/ChromeDevTools/chrome-devtools-mcp):

```json
{"mcpServers":{"chrome-devtools":{
  "command":"npx","args":["-y","chrome-devtools-mcp@latest"]}}}
```

**Memory protocol (claude-mem pattern)** — beyond the §1 PROJECT MEMORY
block: when a filesystem exists keep `MEMORY.md` (decisions log, newest
first, one line each). Start every session by reading it; end every
milestone by appending. The file is the source of truth — *file over app*
(Obsidian law): plain markdown, portable, human-readable.

**Context engineering** — keep working context lean: load only the sections
of this skill the task needs, summarize long assets into the brief, never
paste whole libraries into chat. Smallest set of high-signal tokens wins.

---

## 11 · REDESIGN PROTOCOL (existing sites)

1. **Capture** — `web_fetch` the URL (or Chrome DevTools `navigate_page` +
   `take_screenshot` desktop & 390px, + `list_console_messages`); inventory:
   pages, nav (IA), copy blocks, assets, fonts, colors in use.
2. **Audit score** (1–5 each): identity · hierarchy · color · typography ·
   motion · performance · accessibility · copy. One line of evidence per
   score. Anything ≤2 is a headline problem.
3. **Keep / Kill / Transform** — three lists. Keep = working equity (logo
   recognition, URLs, SEO headings). Kill = clutter, dead effects,
   stock-slop. Transform = good bones, new skin.
4. **Token mapping** — old colors/fonts → new semantic tokens (§3.3/§4.4);
   show the mapping table to the user before rebuilding.
5. **Rebuild** via Phase 2 order. Surgical law (§0.4): unrelated
   functionality is untouched.
6. **Preserve SEO** — URL paths, `<title>`/meta descriptions (improved, not
   discarded), heading semantics, upgraded alt text, redirects list if URLs
   must change.
7. **Prove it** — before/after screenshots at identical viewports + the §13
   gate results.

---

## 12 · DELIVERY MODES

**A · Single-file site (default for landings/demos)** — one `index.html`:
`<head>` order = meta → theme script (§3.5) → `@font-face` (base64 woff2,
§4.4) → token CSS → component CSS; `<body>` = header(brand §2.3) → hero
(canvas + content) → sections → footer; scripts at end = importmap → three
module → UI module. No external deps beyond the three.js CDN.

**B · Project (Vite/React)** — `src/{styles/tokens.css, components/,
three/, lib/motion.ts}`, fonts in `public/fonts/`, R3F per §6.9, routes per
react-router framework mode when multi-page.

**C · Motion video (Remotion)** — for logo stings / promo clips when asked:

```tsx
const f = useCurrentFrame(); const {fps} = useVideoConfig();
const enter = spring({frame:f, fps, config:{damping:200}});
const op = interpolate(f, [0,20], [0,1], {extrapolateRight:'clamp'});
return <AbsoluteFill style={{opacity:op, transform:`scale(${enter})`}}>
  <Logo/> </AbsoluteFill>;
// <Composition durationInFrames={150} fps={30} width={1920} height={1080}/>
// Everything derives from useCurrentFrame() — never wall-clock time.
```
No-Remotion fallback: CSS keyframe sequence + screen-record, or Higgsfield
`generate_video`.

---

## 13 · ZERO-BUG QUALITY GATES (ship contract)

All must pass. With Chrome DevTools MCP, run the live loop; two consecutive
clean passes required.

**Console & correctness**
- [ ] 0 console errors AND 0 warnings (`list_console_messages`)
- [ ] All links resolve; logo navigates home (§2.3); no `href="#"` stubs
- [ ] HTML valid: one `<h1>`, no nested interactive elements, landmarks set
- [ ] Theme toggle: no flash on load, persists, both themes pass contrast

**Visual & layout**
- [ ] CLS ≈ 0 — media has dimensions; fonts `font-display:swap` + intro
      gated on `document.fonts.ready`
- [ ] 360px / 768px / 1280px / 1920px all clean (`resize_page` + screenshot)
- [ ] RTL audit: `dir` correct, logical properties only, lateral motion
      mirrored, Arabic shaping intact (no letter-split spans), `<bdi>` on
      mixed fragments, Arabic punctuation
- [ ] Dark AND light screenshots reviewed (when both shipped)

**Motion & 3D**
- [ ] 60fps during scroll & hero (performance trace: no long tasks >50ms,
      no layout thrash — transforms/opacity only)
- [ ] `prefers-reduced-motion` path manually verified (effects → static)
- [ ] Three.js: DPR clamped, pauses off-screen & on hidden tab, `dispose()`
      wired, WebGL-fail fallback renders
- [ ] No infinite animation runs while its element is off-screen

**A11y & content**
- [ ] Keyboard-only pass: every control reachable, focus visible, no traps
- [ ] Contrast AA verified on real token pairs (§3.4)
- [ ] Icon-only buttons have `aria-label`; images have meaningful `alt`
- [ ] Copy passes §9 self-score ≥35/50; zero lorem ipsum

**DevTools MCP loop**: `new_page(url)` → `list_console_messages` →
screenshots (desktop + `resize_page(390,844)`) → `performance_start_trace`,
reload, `performance_stop_trace` (check LCP <2.5s, CLS <0.1, long tasks) →
`evaluate_script` spot-checks (fonts ready, theme attr, canvas fallback) →
fix → repeat. Never report "done" with a dirty console.

---

## 14 · SOURCE LIBRARY (organized provenance)

**Motion / video** — motion.dev/docs/react · remotion.dev ·
animate-ui.com · ui-skills.com/skills/pbakaus/animate ·
ui-skills.com/skills/jakubantalik/transitions-dev · emilkowal.ski/skill
**3D** — ui-skills.com/skills/cloudai-x/threejs-{fundamentals, interaction,
materials, animation, postprocessing} · threejs.org docs
**Design judgment** — impeccable.style (pbakaus/impeccable) ·
tasteskill.dev (leonxlnx/taste-skill) · ui-ux-pro-max
(nextlevelbuilder) · ui-skills.com/skills/0xdesign/design-lab ·
anthropics/canvas-design · nexu-io/open-design
**Writing** — hardikpandya/stop-slop · juliusbrussee/caveman ·
multica-ai/andrej-karpathy-skills
**Architecture / memory** — safishamsi/graphify (router+references) ·
muratcankoylan/Agent-Skills-for-Context-Engineering ·
thedotmack/claude-mem · kepano/obsidian-skills (file over app) ·
remix-run/react-router-framework-mode · cursor.com/cli
**Effect inspiration (21st.dev)** — UmairXD/particles-bg ·
reapollo/background-dots-masked-pink · thanh/animated-shader-background ·
dhiluxui/aurora-background · dhiluxui/grid-glow-background ·
ravikatiyar/loader-15 · jodesh18/tubes-cursor · 21st.dev/community/components/s/icons
**Tooling** — ChromeDevTools/chrome-devtools-mcp ·
docs.perplexity.ai MCP server · granola.ai · Higgsfield MCP ·
fonts.google.com (Noto Serif, Merriweather)

---

*End of skill. One file. Build the masterpiece, verify it, then stop.*
