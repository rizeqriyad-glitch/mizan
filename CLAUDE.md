# CLAUDE.md — PEN | قلم — Ultra Design System (single-file edition, v2.1)

Auto-read every session. Telegraphic by design (caveman-compressed). Organized
as CORE (always obey) + MODULES M1–M13 (attend deeply ONLY to the module(s)
matching the current task — routing table below). Code/paths/URLs byte-exact.

═══════════════════════════════════════════════════════════════════
CORE — ALWAYS ACTIVE
═══════════════════════════════════════════════════════════════════

## Identity
PEN (قلم) = leading Arabic online learning platform. Next.js 14 + TS + inline
styles. Soul: "Learning as Art" — technical precision + human warmth + authentic
Arabic identity. Skill is universal: for any external site, generate tokens via
M8 and swap this Identity block — everything else applies unchanged
(build-from-zero, redesign, or single component).

## Tokens (memorize — never reinvent)
```
purple #6c47ff · cyan #00c9ff · dark #0f172a · surface #fff · base #f8fafc
gradient: linear-gradient(135deg,#6c47ff,#00c9ff)
font AR: Cairo 400/600/700/900 · EN: Sora 400/600/700/800 · code: Fira Code
radius: card-sm 12 · card-lg 16–20 (hard max) · icon 14–18 · btn 10–12 · pill=tags only
spark colors: #6c47ff #00c9ff #ff6b9d #ffd700 #22c55e · glow rgba(108,71,255,.4)
```
Special fonts (Palestine/Zain-VF/Rakkas/AlJazeera/Rubik/NotoSerif) exist in
`fonts/` — NEVER apply unprompted; ASK-first protocol in M2.

## Durations & easings (single source of truth)
```
micro(hover/press) 80–150ms · element 200–300 · panel/card 300–450
page/hero 500–800 · cinematic 800–1500(–3000 storytelling)
entrance   expo-out  cubic-bezier(.16,1,.3,1)
exit       expo-in   cubic-bezier(.7,0,.84,0)   (exit ≈ 0.8× enter duration)
hover-lift spring    cubic-bezier(.34,1.56,.64,1)   ← buttons/cards ONLY
state      smooth    cubic-bezier(.4,0,.2,1)
press      instant   cubic-bezier(.4,0,.6,1) 80ms
springs {damping/stiffness/mass}: snappy 20/260/1 · gentle 14/120/1 ·
bouncy 8/100/1 · heavy 20/60/2 · PEN-default 18/200/1
```

## ⚡ Token Protocol (graphify + caveman + Cursor + JIT — always on)
1. JIT attention: deep-read ONLY the module(s) the task needs (table below).
   Max 2 modules/task. Never re-derive a module already applied this session.
2. Map-first: read `PROJECT_MAP.md` if it exists; query it instead of grepping
   the codebase. After structural changes → update it (1 line/file). Missing?
   Offer to build it. Same for `PRODUCT_DNA.md` (M9 output).
3. Cursor-style edits: read file before editing → smallest possible diff →
   never rewrite a whole file → never echo unchanged code back to the user.
4. Caveman output: no filler, no preamble, no restating the request. Fragments
   OK. Explain only what changed + why (≤2 lines per change).
5. Plan→act: 3-line plan max for multi-file work, then execute.

## Routing Table (task signal → module)
| Signal | Module |
|---|---|
| colors · tokens · glass · icons · Font Awesome | M1 |
| fonts · typography · RTL · خطوط | M2 |
| animation · easing · hover · transition · Motion lib · animate-ui | M3 |
| state machine · cursor follow/lookAt · magnetic · scroll reveal · pseudo-elements | M4 |
| 3D · hero · Three.js · R3F · particles · shader · Spline | M5 |
| video · Remotion · intro · explainer | M6 |
| logo · brand mark · favicon · animated icon · شعار | M7 |
| brand system · identity guidelines · rebrand | M8 |
| product DNA · soul · positioning · voice | M9 |
| ad · campaign · promo creative · إعلان | M10 (explicit request only) |
| UI/UX review · redesign · landing · layout · copy | M11 |
| components · state mgmt · a11y · structure | M12 |
| bug · jank · slow · perf audit · zero-defects | M13 |

## 🔒 Hard Rules (never break — any task)
```
✅ preserve useEffect/useState/useLanguage/useAuth · all t('','') strings
✅ preserve hrefs · API_BASE · fetch calls · direction: isArabic?'rtl':'ltr'
✅ Three.js only via cdn.jsdelivr.net/npm/three@0.160
✅ animate transform/opacity/filter ONLY (never width/height/top/left/margin)
✅ prefers-reduced-motion respected on EVERY animation
✅ content visible by default — reveal classes enhance, never gate visibility
❌ delete props/functions · change t() text · localStorage in artifacts
❌ new dependencies without telling the user · multiple parallel rAF loops
❌ hover without reverse on leave · listeners/rAF without cleanup on unmount
```

## Workflow
NEW page/section → M11 first (name an aesthetic stance in one line) + relevant
module. Hero? add M5. Apply data-reveal + glass + magnetic CTA.
EDIT existing → read full file → identify what works/breaks → enhance visuals
only → logic untouched.
REDESIGN → audit-first: list 5 concrete flaws (hierarchy, contrast, density,
motion, copy) → propose direction → build. Never redesign blind.
DONE check (every delivery): PEN tokens? ≥1 wow moment? RTL+LTR ok?
reduced-motion ok? a11y labels? console clean? states (loading/empty/error)?

## File Map
```
apps/web/app: page.tsx(home) globals.css layout.tsx courses/ dashboard/ auth/ exams/
apps/web/components: Navbar Footer Logo · lib/cart.tsx
```
Conflicts between modules → PEN identity wins (gradient text, glass, eyebrows —
within M11 caps).

═══════════════════════════════════════════════════════════════════
M1 — IDENTITY DETAIL (glass · gradients · icons)
═══════════════════════════════════════════════════════════════════

Tinted neutrals: tint grays toward purple hue, never generic warm/cool.
Gray-on-color: darker shade of the SAME hue, not generic gray.
Gradient text: hero headings + key highlights only, never body.
Dark sections alternate with light for rhythm; purple glow anchors CTAs.

## Glass icon system (categories/features/stats/teacher icons)
```css
.glass-icon-qalam{
  background:linear-gradient(135deg,rgba(108,71,255,.2),rgba(0,201,255,.08));
  backdrop-filter:blur(20px) saturate(180%);
  border:1px solid rgba(108,71,255,.25);border-radius:18px;
  box-shadow:0 8px 32px rgba(108,71,255,.15),
    inset 0 1px 0 rgba(255,255,255,.4),inset 0 -1px 0 rgba(108,71,255,.1);
  transition:transform .4s cubic-bezier(.34,1.56,.64,1);position:relative;}
.glass-icon-qalam::before{content:'';position:absolute;inset:1px;border-radius:17px;
  background:linear-gradient(135deg,rgba(255,255,255,.4),transparent 60%);pointer-events:none;}
.glass-icon-qalam:hover{
  transform:perspective(400px) rotateY(-8deg) rotateX(4deg) translateY(-6px);
  box-shadow:16px 16px 40px rgba(108,71,255,.25),inset 0 1px 0 rgba(255,255,255,.5);}
```
Generic glass (dark surfaces): `rgba(255,255,255,.08)` + `backdrop-filter:
blur(24px) saturate(180%)` + `border:1px solid rgba(255,255,255,.12)` + inset
top highlight. Use purposefully — feature sections + teacher cards, NOT every
container.
Soft glow util: `box-shadow:0 0 0 1px ${c}22,0 4px 24px ${c}33,0 12px 48px ${c}18`.
Noise overlay (material feel): SVG feTurbulence baseFrequency .9, opacity .04,
applied as a pseudo-element.
3D depth wrapper: `perspective:1000px; transform-style:preserve-3d`.

## Icons — Font Awesome Free (never emoji / ad-hoc SVG)
```bash
npm i @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/react-fontawesome
```
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIconName } from '@fortawesome/free-solid-svg-icons'
<FontAwesomeIcon icon={faIconName}/>
```
solid = UI/feature icons · regular = decorative/outline.
Canvas/Three texture: `const i=icon(faDef); const path=Array.isArray(i.icon[4])
?i.icon[4].join(' '):i.icon[4]; const w=i.icon[0],h=i.icon[1];` →
`new Path2D(path)` on a 2D ctx → THREE.CanvasTexture.

═══════════════════════════════════════════════════════════════════
M2 — TYPOGRAPHY & FONT VAULT (ask-first protocol · RTL)
═══════════════════════════════════════════════════════════════════

Defaults (no permission needed): AR **Cairo**, EN **Sora**, code Fira Code.
Max 3 families/page; PEN uses 2 — a 3rd requires the protocol below.

## ⚠️ ASK-FIRST protocol (special fonts)
Apply ONLY when (a) user names one, or (b) a strong mood-fit is detected →
then OFFER, never apply silently:
> "This section suits {X} ({one-line reason}). Apply it, or keep Cairo?"
On approval: copy needed woff2 from skill `fonts/` → `apps/web/public/fonts/`,
add its @font-face rule, preload the woff2 in the layout head.

## Arabic vault (files shipped in fonts/, woff2 + raw)
| Family (CSS name) | Files | Voice / use | Never |
|---|---|---|---|
| **Al Jazeera Arabic** 300/400/700 | aljazeera-*.woff2 | editorial, news, trustworthy long-form, dashboards | display > 72px |
| **Zain** (variable, custom axis `'long'` 0→800 = letter elongation/kashida) | zain-vf.woff2 | hero display; animate the axis for premium kashida reveals | body text |
| **Rakkas** 400 | rakkas.woff2 | bold Ruqaa posters, festive headlines, ad creative | paragraphs, UI labels |
| **Palestine** 400 | palestine.woff2 | cultural/heritage accents, short titles, certificates | body, buttons |

Zain elongation animation (signature move):
```css
.zain-hero{font-family:'Zain';font-variation-settings:'long' 0;
  transition:font-variation-settings 1.2s cubic-bezier(.16,1,.3,1);}
.zain-hero.revealed{font-variation-settings:'long' 600;}
/* or scroll-link: map scrollYProgress → 'long' 0–800 via inline style */
```

## English vault (Google Fonts — import on approval only)
| Family | Voice / use |
|---|---|
| **Rubik** 300–900 variable + italic | geometric sans, rounded, friendly product UI, marketing. Also supports Arabic — valid bilingual single-family option (ask first) |
| **Noto Serif** 100–900 variable (+width axis) | editorial serif, articles, premium long-form, certificates |
```css
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap');
```

## @font-face block (vault — include only families actually used)
```css
@font-face{font-family:'Al Jazeera Arabic';src:url('/fonts/aljazeera-light.woff2') format('woff2'),url('/fonts/aljazeera-light.ttf') format('truetype');font-weight:300;font-display:swap}
@font-face{font-family:'Al Jazeera Arabic';src:url('/fonts/aljazeera-regular.woff2') format('woff2'),url('/fonts/aljazeera-regular.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:'Al Jazeera Arabic';src:url('/fonts/aljazeera-bold.woff2') format('woff2'),url('/fonts/aljazeera-bold.ttf') format('truetype');font-weight:700;font-display:swap}
@font-face{font-family:'Zain';src:url('/fonts/zain-vf.woff2') format('woff2'),url('/fonts/zain-vf.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:'Rakkas';src:url('/fonts/rakkas.woff2') format('woff2'),url('/fonts/rakkas.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:'Palestine';src:url('/fonts/palestine.woff2') format('woff2'),url('/fonts/palestine.otf') format('opentype');font-weight:400;font-display:swap}
/* stacks */
.font-aljazeera{font-family:'Al Jazeera Arabic','Cairo',sans-serif}
.font-zain{font-family:'Zain','Cairo',sans-serif}
.font-rakkas{font-family:'Rakkas','Cairo',serif}
.font-palestine{font-family:'Palestine','Cairo',serif}
.font-rubik{font-family:'Rubik','Sora',sans-serif}
.font-notoserif{font-family:'Noto Serif',Georgia,serif}
```

## Pairings that work
Cairo+Sora (default) · AlJazeera+NotoSerif (editorial) · Zain display + Cairo
body (landing hero) · Rakkas display + AlJazeera body (campaign/ad) · Rubik
solo (bilingual app).

## Type rules (always)
- Body line length ≤ 70ch · line-height 1.5–1.75 (Arabic prefers 1.8–2.0).
- Heading scale steps ≥ 1.25× apart. Hero clamp() max ≤ 6rem.
- Display letter-spacing ≥ −0.04em. Arabic: NEVER negative tracking (breaks joins).
- No all-caps body; uppercase = short Latin labels ≤4 words (Arabic has no caps).
- Arabic display renders ~10% larger optically → size 5–10% down vs Latin equivalent.
- `font-display:swap` + preload above-fold woff2:
  `<link rel="preload" as="font" type="font/woff2" crossorigin>`.

## RTL essentials
dir from `isArabic?'rtl':'ltr'` (preserve existing logic). Logical properties
(margin-inline-start, padding-inline, inset-inline) not left/right. Keep Latin
digits in stats/prices unless asked for Arabic-Indic. Directional icons
(arrows/chevrons) flip: `[dir='rtl'] & {transform:scaleX(-1)}`.

═══════════════════════════════════════════════════════════════════
M3 — MOTION (Motion lib · Emil taste · 12 principles · canvas · RTL)
═══════════════════════════════════════════════════════════════════

## Emil Kowalski taste (design-engineering law)
- Animate with purpose; the best motion is barely noticed. If unsure → don't.
- Fast feels premium: most UI ≤300ms. Frequent actions (dropdowns, tooltips) fastest.
- ease-out for user-initiated enters; ease-in-out for on-screen moves; never
  linear (except marquees/spinners).
- Interruptibility: animations must retarget mid-flight (springs/Motion do;
  CSS keyframes don't).
- Origin-aware: scale/fade FROM the trigger (`transform-origin` at click point).
- Pair opacity with small movement (y 8–16px); add slight `blur(4px)→0` for silk.
- Exit faster than enter (~0.8×). Hover must reverse on leave.
- Taste check: would Vercel/Linear ship this? Subtle > flashy.

## Disney's 12 principles → web mapping
1 Squash&stretch → scale .97 press / 1.03 hover (≤6% in UI). 2 Anticipation →
tiny counter-move before main (−2px up before drop-in). 3 Staging → animate ONE
focal thing; dim the rest. 4 Straight-ahead vs pose-to-pose → physics(springs)
vs keyframes; pick per effect. 5 Follow-through/overlap → children settle after
parent (stagger 40–80ms); nothing stops all-at-once. 6 Slow-in/out → CORE easing
table. 7 Arcs → organic objects move on curves (bezier), not straight lines.
8 Secondary action → glow/shadow shifts SUPPORT the main move, never compete.
9 Timing → weight = duration (heavy modal slower than chip). 10 Exaggeration →
hero/celebration moments only (confetti, success). 11 Solid drawing → consistent
perspective/light in 3D tilts. 12 Appeal → asymmetry + character beat mechanical
uniformity.

## Motion for React (motion.dev) — API core
```tsx
import { motion, AnimatePresence, useScroll, useTransform, useSpring,
  useMotionValue, useInView, useReducedMotion, MotionConfig, LayoutGroup } from "motion/react"
```
- `<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}
   transition={{type:'spring',damping:18,stiffness:200}}/>`
- Gestures: `whileHover={{scale:1.03}} whileTap={{scale:.97}} whileFocus
  whileDrag` + `drag dragConstraints` (cross-device, beats CSS :hover on touch).
- Scroll-trigger: `whileInView={{...}} viewport={{once:true,amount:.15,
  margin:'0px 0px -60px'}}`.
- Scroll-link: `const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});
  const y=useTransform(scrollYProgress,[0,1],[60,-60]);` smooth it:
  `useSpring(v,{damping:20,stiffness:120})`.
- Variants + stagger:
```tsx
const list={hidden:{},show:{transition:{staggerChildren:.06,delayChildren:.1}}};
const item={hidden:{opacity:0,y:16},show:{opacity:1,y:0,
  transition:{type:'spring',damping:18,stiffness:200}}};
<motion.ul variants={list} initial="hidden" whileInView="show" viewport={{once:true}}>
  {items.map(i=><motion.li key={i} variants={item}/>)}</motion.ul>
```
- Exit: wrap with `<AnimatePresence mode="wait|popLayout">` + stable `key`
  (else exit never runs).
- Layout: `layout` prop animates size/position via transforms; `layoutId="x"` =
  shared-element morph (tab underline, card→modal). Wrap related in
  `<LayoutGroup>`. Cheap and gorgeous.
- SVG: `<motion.path initial={{pathLength:0}} animate={{pathLength:1}}/>` draw-on.
- A11y: `const reduce=useReducedMotion()` → opacity-only when true. Or global
  `<MotionConfig reducedMotion="user">`.
- Springs are default for x/y/scale; tweens for opacity/color — keep defaults.
PEN page entrance: opacity 0→1 + y 12→0, 400ms expo-out. Card hover: y −3px
120ms spring-lift + shadow grow + scale 1.02.

## animate-ui recipes (Motion + Tailwind patterns — rebuild, don't blind-import)
Counting number: useSpring on a MotionValue → render rounded. Typing text:
clip-path inset reveal or per-char stagger (.03s). Gradient text sweep:
background-position keyframes on bg-clip-text. Highlight text: scaleX
origin-left pseudo behind. Bubble/particle bg: canvas (below), not DOM nodes.
Icon micro: animate stroke pathLength + slight rotate on hover. Ripple: circle
at pointer coords, scale 0→2.5 + fade.

## CSS scroll reveal (no-lib pages — content visible by default!)
```js
const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){
  e.target.classList.add('revealed');ob.unobserve(e.target);}}),
 {threshold:.15,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('[data-reveal]').forEach(el=>ob.observe(el));
```
```css
[data-reveal]{opacity:0;transform:translateY(32px);
  transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);}
[data-reveal].revealed{opacity:1;transform:none}
[data-reveal]:nth-child(1){transition-delay:0ms}
[data-reveal]:nth-child(2){transition-delay:80ms}
[data-reveal]:nth-child(3){transition-delay:160ms}
[data-reveal]:nth-child(4){transition-delay:240ms}
@media(prefers-reduced-motion:reduce){
  [data-reveal]{opacity:1;transform:none;transition:none}}
```
Rule: never gate visibility on a JS-only class — SSR/hidden-tab must still show
content.

## Magnetic CTA (every primary button)
```js
document.querySelectorAll('.btn-magnetic').forEach(b=>{
 b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();
  b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.25}px)`;});
 b.addEventListener('mouseleave',()=>{b.style.transform='';
  b.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)';});});
```

## Canvas / rAF physics (rockets, particles, depth)
1. ONE rAF loop drives everything. 2. Delta time always:
```ts
let last=0;const loop=(now:number)=>{const dt=Math.min((now-last)/1000,.05);
 last=now;update(dt);draw();requestAnimationFrame(loop)};
requestAnimationFrame(t=>{last=t;loop(t)});
```
3. Bezier arc path per axis: `B(t)=(1−t)³p0+3(1−t)²t·p1+3(1−t)t²·p2+t³p3`;
rotation = `Math.atan2(dy,dx)` of tangent (sample t+0.01).
4. Particles: burst spawn on trigger (not continuous); each
{x,y,vx,vy,life 0→1,size,color}; gravity `vy+=.15*dt*60`; drag `v*=.98`; kill
life≤0; `ctx.globalAlpha=life` fade; `life-=.02*dt*60`.
5. Depth illusion: scale `(1−z*.3)`; `ctx.filter=blur(${z*2}px)`; draw far→near
(painter's algorithm); `ctx.shadowBlur=20*(1−z)`.
6. Lerp: `from+(to−from)*clamp01(t)`. Spring without a lib (critically damped):
```ts
let pos=0,vel=0;const k=180,d=20,m=1;
const tick=(dt:number,target:number)=>{
  vel+=((-k*(pos-target))+(-d*vel))/m*dt;pos+=vel*dt;return pos};
```

## RTL motion
translateX inverts in RTL: slide-from-right(LTR) = slide-from-LEFT(RTL).
Directional vx flips (sidebar side changes: LTR right→vx positive, RTL left→vx
negative). Check `document.dir`/`isArabic` before signing any horizontal value.
Bezier control points mirror too.

## Choreography
Stagger 40–80ms (2–4 frames @60fps) — never simultaneous siblings. Sequence =
named phases (0–200ms enter spring · 200–400 content fade · 400+ idle). Exit:
animate OUT first, remove from DOM after duration — never instant unmount of
visible UI.

## Motion anti-patterns ❌
width/height/top/left animation · parallel rAF loops · animation-delay for
logic sequencing (use frame offsets) · fixed dt · unclamped interpolation → ∞ ·
missing cancelAnimationFrame/removeEventListener on unmount · CSS transitions
where frame-precision is needed · bounce easing on content reveals (buttons
only) · hover with no reverse · ignoring prefers-reduced-motion.

═══════════════════════════════════════════════════════════════════
M4 — INTERACTION (Spline/Hana state machines · pseudo-elements)
═══════════════════════════════════════════════════════════════════

## Core philosophy: state-based everything
Every interactive element = BASE state + variant states; animate by
TRANSITIONING STATES, never timelines. Result: reversible, composable,
event-driven, GPU-only (transform/opacity/filter).

## State machine pattern
```tsx
type S='base'|'hover'|'active'|'disabled'|'loading';
const [s,setS]=useState<S>('base');
const style:Record<S,React.CSSProperties>={
 base:{transform:'scale(1)',opacity:1},hover:{transform:'scale(1.04)'},
 active:{transform:'scale(.97)',opacity:.9},disabled:{opacity:.4},
 loading:{opacity:.7,filter:'blur(2px)'}};
const tr:Record<S,string>={
 base:'all .35s cubic-bezier(.34,1.56,.64,1)',
 hover:'all .2s cubic-bezier(.16,1,.3,1)',
 active:'all .08s cubic-bezier(.4,0,.6,1)',
 disabled:'all .25s ease',loading:'all .3s ease'};
<div style={{...style[s],transition:tr[s]}}
 onMouseEnter={()=>setS('hover')} onMouseLeave={()=>setS('base')}
 onMouseDown={()=>setS('active')} onMouseUp={()=>setS('hover')}/>
```
Event map: Hover→onMouseEnter/Leave · Down/Up→onMouseDown/Up · Press→onClick ·
Key→onKeyDown/Up (window) · LookAt/Follow→onMouseMove math · Scroll→
IntersectionObserver · Touch→onTouchStart/End/Move.

## LookAt (tilt toward cursor — signature effect)
```tsx
const useLookAt=(ref:React.RefObject<HTMLElement>,max=15)=>{useEffect(()=>{
 const el=ref.current;if(!el)return;
 const mv=(e:MouseEvent)=>{const r=el.getBoundingClientRect();
  const dx=(e.clientX-(r.left+r.width/2))/(r.width/2);
  const dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
  el.style.transform=`perspective(600px) rotateY(${dx*max}deg) rotateX(${-dy*max}deg)`;
  el.style.transition='transform .1s ease-out';};
 const rs=()=>{el.style.transform='perspective(600px)';
  el.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)';};
 el.addEventListener('mousemove',mv);el.addEventListener('mouseleave',rs);
 return()=>{el.removeEventListener('mousemove',mv);
  el.removeEventListener('mouseleave',rs);};},[]);};
// usage: const cardRef=useRef<HTMLDivElement>(null); useLookAt(cardRef);
```

## Follow (element chases cursor, lerped)
```tsx
const useFollow=(ref:React.RefObject<HTMLElement>,k=.15)=>{
 const p=useRef({x:0,y:0}),t=useRef({x:0,y:0}),id=useRef(0);
 useEffect(()=>{const mv=(e:MouseEvent)=>t.current={x:e.clientX,y:e.clientY};
  window.addEventListener('mousemove',mv);
  const loop=()=>{p.current.x+=(t.current.x-p.current.x)*k;
   p.current.y+=(t.current.y-p.current.y)*k;
   if(ref.current)ref.current.style.transform=
     `translate(${p.current.x}px,${p.current.y}px)`;
   id.current=requestAnimationFrame(loop)};
  id.current=requestAnimationFrame(loop);
  return()=>{window.removeEventListener('mousemove',mv);
   cancelAnimationFrame(id.current)};},[]);};
```
Custom cursor = Follow on fixed dot+ring (ring k=.08, dot k=.3); scale ring on
interactive hover; hide on touch devices.

## Shape morphing
SVG `d` swap (equal point count):
`<path d={active?pathB:pathA} style={{transition:'d .4s cubic-bezier(.16,1,.3,1)'}}/>`.
clip-path states: rectangle → bottom-notch → octagon polygons,
`transition:clip-path .35s cubic-bezier(.34,1.56,.64,1)`.

## Pseudo-elements arsenal (free DOM, zero JS)
- Gradient border: parent `position:relative;background:padding-box` +
  `::before{inset:-1px;border-radius:inherit;background:var(--gradient);z-index:-1}`.
- Glass top-light: `::before{inset:1px;background:linear-gradient(135deg,
  rgba(255,255,255,.4),transparent 60%)}`.
- Underline grow (links): `::after{height:2px;width:0;transition:width .3s
  cubic-bezier(.16,1,.3,1)}` → hover width:100%.
- Hover sheen: skewed white-gradient `::after` translateX −150%→150% .8s.
- Corner ticks, eyebrow lines, badge dots, tooltip arrows → pseudo, not divs.
Rules: always `content:''`; `pointer-events:none` for decoration; contain stacks
with `isolation:isolate` on parent; animate only transform/opacity/
background-position (compositor-cheap).

## Interaction design law
Feedback <100ms for press (else feels broken). Affordance: clickable LOOKS
clickable (cursor-pointer + hover state). Forgiveness: destructive = confirm or
undo, never instant. Hit area ≥44px even if visual smaller (padding/::before
expands). Loading >400ms → skeleton/spinner; >2s → progress + copy. Focus ring
always visible (`:focus-visible`). Touch: no hover-dependent reveals — provide
a tap alternative.

## PEN application map
Cards: useLookAt + state machine (lift+glow hover) + glass + stagger reveal.
Buttons: scale 1.03 hover / .97 active 80ms + purple glow + magnetic (M3).
Hero: stagger-children entrance expo-out 600ms; bg elements subtle Follow drift.
Icons/badges: LookAt + clip-path morph on state change + soft glow matching color.

═══════════════════════════════════════════════════════════════════
M5 — 3D HEROES (Three.js · R3F · shaders · Spline-grade)
═══════════════════════════════════════════════════════════════════

When: landing/hero, visually-empty hero, sections needing a wow moment, product
showcases. NOT content-dense pages. One scene per page max.

## Hard rules
```js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
```
Mouse parallax mandatory in every scene + spring smoothing (never snap):
```js
addEventListener('mousemove',e=>{mouse.x=(e.clientX/innerWidth-.5)*2;
 mouse.y=-(e.clientY/innerHeight-.5)*2;});
target.x+=(mouse.x-target.x)*.05; target.y+=(mouse.y-target.y)*.05; // in loop
```
Cleanup on unmount: cancel rAF, renderer.dispose(), geometry/material
.dispose(), remove listeners. Pause when `document.hidden` or canvas off-screen
(IntersectionObserver).

Best objects for an education platform: particle knowledge-network (neural) ·
floating 3D books/pages · geometric Arabic letters slow-rotating · orbit system
(atom/planets) · flowing gradient blob.

## Hero recipe A — Particle network (21st.dev-style backdrop)
```js
const N=180,pos=new Float32Array(N*3),vel=[];
for(let i=0;i<N;i++){pos.set([(Math.random()-.5)*20,(Math.random()-.5)*12,
 (Math.random()-.5)*8],i*3);
 vel.push({x:(Math.random()-.5)*.004,y:(Math.random()-.5)*.004});}
const g=new THREE.BufferGeometry();
g.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0x6c47ff,
 size:.06,transparent:true,opacity:.9}));
// lines: each frame, pairs dist<2.2 → LineSegments, opacity=1-d/2.2, cyan
// drift: pos+=vel, bounce at bounds; group rotation follows target.x*.3
```
Perf: cap N ≤250 desktop / ≤120 mobile; line pass is O(n²) → grid-hash or
sample pairs.

## Hero recipe B — Gradient blob (shader, premium feel)
IcosahedronGeometry(2,64) + ShaderMaterial: vertex displaces along normal with
simplex noise(time, pos*freq); fragment mixes #6c47ff→#00c9ff by fresnel
(`pow(1.0-dot(normal,viewDir),2.0)`) + subtle emissive. Slow rotation + mouse
spring. No-shader budget alternative: MeshPhysicalMaterial roughness .15,
transmission .9.

## Hero recipe C — Floating glass shards / books
8–14 InstancedMesh boxes, MeshPhysicalMaterial{transmission:.9,roughness:.1,
thickness:.5, purple tint}. Each: unique float phase
`y=base+sin(t*spd+phase)*amp`, slow random rotation. Light: RoomEnvironment or
3 point lights (purple/cyan/white).

## React Three Fiber (when inside the React tree)
```tsx
import {Canvas,useFrame} from '@react-three/fiber'
import {Float,Environment} from '@react-three/drei'
<Canvas dpr={[1,2]} gl={{antialias:true,alpha:true}}
 camera={{position:[0,0,6],fov:45}}>
 <Float speed={1.4} rotationIntensity={.6} floatIntensity={1.2}><Mesh/></Float>
 <Environment preset="city"/></Canvas>
```
`useFrame((s,dt)=>{...})` = the one loop; lerp toward s.mouse for parallax.
drei cheats: Float, MeshTransmissionMaterial, Text3D, Sparkles, Stars,
ContactShadows, ScrollControls(+useScroll) for scroll-driven 3D.
NOTE inside claude.ai artifacts: three r128 only — no CapsuleGeometry, no
THREE.OrbitControls; use CylinderGeometry + manual orbit math.

## Scroll-driven 3D
Map scroll progress → camera/object:
`const p=scrollY/(docH-winH); cam.position.z=6-p*3; group.rotation.y=p*Math.PI;`
(smooth with the .05 lerp). R3F: `<ScrollControls pages={3}>` + useScroll().offset.

## Performance budget (non-negotiable)
60fps target / 30 floor mobile. dpr ≤2. Draw calls <100 (instancing!). Tris
<300k hero. Textures ≤2048², compressed. No per-frame allocation (reuse
vectors). Lights ≤3 dynamic. Shadows: single directional 1024 map or fake via
ContactShadows/blob. Test: devtools 4× CPU throttle must stay interactive.
Fallback: static gradient + CSS particles when WebGL unavailable or
reduced-motion.

## Spline-like authoring mindset
Build scenes as STATE GRAPHS (M4): base/hover/pressed per object, transitions =
springs. Export-quality look = soft env light + fresnel rim + slight film-grain
overlay (M1 noise) + depth fog `scene.fog=new THREE.Fog(0x0f172a,8,18)` on dark
heroes.

═══════════════════════════════════════════════════════════════════
M6 — REMOTION VIDEO (frame-precise React)
═══════════════════════════════════════════════════════════════════

Philosophy: animation = pure function of frame. Same input → same pixel.
Deterministic · interruptible/scrubbable · composable. For meaningful motion in
video contexts NEVER CSS transitions — frame math only.

```bash
npx create-video@latest apps/video   # when intro/explainer/hero-video requested
```
```tsx
import {useCurrentFrame,useVideoConfig,interpolate,spring,Easing,
 AbsoluteFill,Sequence,Series} from 'remotion';
const frame=useCurrentFrame();
const {fps,durationInFrames,width,height}=useVideoConfig();
```

## The 3 primitives (everything builds from these)
1) **interpolate(frame,[in],[out],{extrapolateLeft:'clamp',
   extrapolateRight:'clamp',easing})** → opacity/x/y/scale/blur/rotation/color.
   `const opacity=interpolate(frame,[0,30],[0,1],{extrapolateRight:'clamp'});`
   `const x=interpolate(frame,[0,40],[60,0],{easing:Easing.out(Easing.cubic),
    extrapolateRight:'clamp'});` (RTL: flip sign)
2) **spring({frame,fps,config:{damping,stiffness,mass},delay?})** → entrances,
   pops, natural settle. Presets in CORE. Map: `scale=.8+spr*.2`.
3) **Easing**: out(cubic)=enter · in(quad)=exit/launch · inOut(ease)=move ·
   bezier(x1,y1,x2,y2)=custom · elastic(1.2)=overshoot.

## Official best practices
- ALWAYS clamp extrapolation — unclamped values → ∞ (top ship-breaker).
- Determinism: no Math.random() → use remotion's `random(seed)`; no Date.now();
  no fetch in render path (precompute via calculateMetadata/props).
- Sequencing with `<Sequence from={30} durationInFrames={60}>` (frame offsets),
  `<Series>` for chains — NEVER setTimeout/animation-delay logic.
- Each scene = component inside `<AbsoluteFill>`; compose, don't position ad-hoc.
- Stagger: `const f=Math.max(0,frame-i*4)` then spring(f) per item
  (≈60–80ms @60fps).
- Assets via staticFile(); fonts via @remotion/google-fonts or local loadFont.
- Audio: `<Audio volume={f=>interpolate(f,...)}/>` for ducking/fades.
- Prefer @remotion/* packages (transitions, gif, lottie, shapes, noise).
- Compositions stay pure — props in, pixels out; preview must equal render.

## Choreography template (PEN intro)
```
0–20f   logo spring-in (scale .6→1, damping 12)
14–34f  wordmark letters stagger fade+y (4f offsets)
30–60f  tagline opacity interpolate + tracking settle
55–75f  gradient sweep across logo (background-position)
75f+    idle loop: subtle float sin(frame/30)*4px
```
Exit any scene: 0.8× enter duration, Easing.in(quad).

## No-Remotion fallback (same math in-browser, rAF)
elapsed-ms drives everything: lerp + critically-damped spring tick from M3
§canvas. Use for in-app "video-like" sequences (onboarding panels) when adding
Remotion is overkill.

PEN look in video: identity colors only · particle bursts = spark palette ·
type Cairo/Sora (or approved special font via M2) · sizes per request:
1080×1920 reels / 1920×1080 hero / 1080×1080 square.

═══════════════════════════════════════════════════════════════════
M7 — LOGO LAB (interactive marks, Claude-grade)
═══════════════════════════════════════════════════════════════════

Goal: derive a modern, animated, INTERACTIVE mark from `site name + purpose`,
with matching text lockup. Never clipart, never generic shield/swoosh.

## Process (always this order)
1 Extract DNA (or load PRODUCT_DNA.md / run M9): name meaning, domain,
audience, 3 feel-words, primary color.
2 Pick 2 concepts from the families below → present both as small inline SVG
previews + 1-line rationale each → user picks → refine.
3 Build mark → motion states → lockup → exports.

## Construction families (choose by purpose)
| Family | Build method | Fits |
|---|---|---|
| Radial burst (Claude-style) | N strokes/petals rotated around center, organic length variance ±15%, rounded caps | AI, energy, knowledge, community |
| Letterform mutation | initial letter (AR or EN), cut/extend/merge one stroke into a symbol (قلم: ق dot→orbit; pen-nib from ل) | identity-strong brands |
| Geometric construct | circles/squares on 8pt grid, golden-ratio overlaps, single accent cut | tech, fintech, edu |
| Continuous line | one path draws the metaphor (book→bird, pen→arrow) | craft, creative, story brands |
| Negative space | counter-shape hides a 2nd meaning | clever/premium |
| Particle/generative | dots forming letter or shape (pairs with M5 hero) | data, AI, platforms |

## Parametric radial mark (the Claude pattern — adapt, never copy)
```tsx
const Mark=({n=12,r1=14,r2=42,c='#6c47ff'})=>(
 <svg viewBox="0 0 100 100" width="64">
  <g className="mark">{Array.from({length:n},(_,i)=>{
   const a=(i/n)*Math.PI*2, v=1+Math.sin(i*2.7)*.15;   // organic variance
   const x1=50+Math.cos(a)*r1,y1=50+Math.sin(a)*r1;
   const x2=50+Math.cos(a)*r2*v,y2=50+Math.sin(a)*r2*v;
   return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
     stroke={c} strokeWidth="6" strokeLinecap="round"
     style={{transformOrigin:'50px 50px'}}/>;})}</g></svg>);
```
Variance + rounded caps = warmth; perfect symmetry = sterile. PEN version:
gradient stroke (purple→cyan `<linearGradient>`), n=10, pen-nib silhouette in
the negative center.

## Motion states (every logo ships with all 4)
```css
/* idle — alive, ignorable */
.mark{animation:idle 14s linear infinite}
@keyframes idle{to{transform:rotate(360deg)}}  /* or 4s pulse scale 1↔1.03 */
/* hover — react in <100ms */
a:hover .mark{animation-duration:2.5s}
a:hover .mark line{stroke-width:7;transition:.2s cubic-bezier(.34,1.56,.64,1)}
/* entrance — draw-on */
.mark line{stroke-dasharray:40;stroke-dashoffset:40;
 animation:draw .6s cubic-bezier(.16,1,.3,1) forwards}
.mark line:nth-child(1){animation-delay:0ms}    /* …i*40ms per line */
@keyframes draw{to{stroke-dashoffset:0}}
/* loading — the logo IS the spinner: fast rotate + per-stroke opacity wave */
@media(prefers-reduced-motion:reduce){.mark,.mark *{animation:none!important}}
```
Richer (Motion lib): per-line `motion.line` pathLength spring stagger; hover
`whileHover={{rotate:15,scale:1.05}}`; cursor LookAt tilt via M4.

## Text lockup (wordmark)
Font = brand display (M2 protocol; PEN: Cairo 900 AR / Sora 800 EN). Mark
height = cap-height ×1.15 · gap = ×0.5 cap · optical (not mathematical)
centering. Tracking −0.02em max EN, 0 AR. Bilingual: mark center, قلم right,
PEN left — mark must work alone at 16px (favicon test). Hover: mark animates,
text underline grows (M4 pseudo).

## 3D mark (when the hero deserves it)
Extrude the SVG: `new THREE.ExtrudeGeometry(svgShapes,{depth:6,bevelSize:1.2,
bevelSegments:3})` + MeshPhysicalMaterial (transmission .85 glass, or metal
roughness .25 with purple/cyan lights) + Float + LookAt. Or particle-formed
logo: sample SVG path points → particles spring to targets on load, scatter on
hover (M5).

## Deliverables checklist
SVG (currentColor-capable) · mark-only + horizontal lockup + stacked ·
light/dark variants · favicon 16/32 (simplified: drop variance, thicken) ·
safe-area = mark height ×0.5 · motion spec block (the 4 states) · usage don'ts
(no stretch, no off-palette recolor, min size).

═══════════════════════════════════════════════════════════════════
M8 — BRAND IDENTITY SYSTEMS (new site OR rebrand)
═══════════════════════════════════════════════════════════════════

Use when: building identity from zero, rebranding, or generating tokens for a
non-PEN site so this whole skill can apply to it.
Pipeline: 1 Discovery → 2 Strategy → 3 Visual system → 4 Assets → 5 Guidelines
page. Each step's output feeds the next. Ask ≤3 sharp questions up front
(industry+audience, 3 feel-words, admired brands) — infer the rest.

## 1 Discovery (5-min brief interrogation)
What does it do (one verb)? For whom (one persona)? Against whom? Why care (one
promise)? Feel-words ×3. If a product exists → run M9 first and import output.

## 2 Strategy → design translation
| Archetype (pick 1–2) | Visual consequence |
|---|---|
| Sage (knowledge) | serif/strong type, generous whitespace, deep blues/purple |
| Creator | expressive display type, gradient energy, asymmetry |
| Hero | bold weight, high contrast, sharp radius, motion punch |
| Caregiver | soft radius, warm tints, gentle springs |
| Explorer | wide layouts, photography, horizon lines |
| Jester | bouncy easing allowed, saturated accents, playful icons |
Write one positioning line: "{brand} is the {category} that {differentiator}
for {audience}".

## 3 Visual system (generate ALL tokens)
**Color**: 1 primary (from feel-words: trust→blue/purple · growth→green ·
energy→orange/coral · premium→deep neutrals + metal accent) + 1 accent
(complement or analog +30° hue) + neutral ramp TINTED toward primary (9 steps,
oklch preferred) + semantics (success/warn/error tuned to palette, each ≥4.5:1
on its background).
**Type**: display + body pair via M2 pairings; scale (1.25× steps), weights in
use, AR/EN mapping.
**Shape**: radius scale + border philosophy (hairline vs none vs chunky).
**Motion personality**: pick a spring preset (CORE) — this IS brand voice in
time: snappy=confident · gentle=caring · bouncy=playful.
**Texture**: flat / glass / grain / gradient-mesh — exactly ONE signature.
**Iconography**: stroke width + corner style matching type (rounded font →
rounded icons); Font Awesome solid/regular policy.
Output as a CSS-variables block ready for globals.css — this becomes the site's
Identity, replacing PEN tokens on external projects.

## 4 Assets
Logo via M7 (mark + lockup + motion states) · favicon set · OG-image template
(1200×630: mark + headline in display font + gradient bg) · social avatar
(mark on primary) · email signature strip.

## 5 Guidelines page (deliver as /brand route or brand.html)
Sections: logo + clearspace + misuse · color with contrast table · type
specimens AR+EN · motion demos (live: the 4 logo states + button states) ·
component previews (button/card/input in-identity) · voice: 3 do/don't lines.
The page itself must BE the identity (dogfood) and follow M11.

## Acceptance
Squint test: recognizable at 10% size/blur? Tokens complete (no "TBD")? Works
dark+light? AR+EN both DESIGNED (not just translated)? Motion personality
demonstrable in a single button?

═══════════════════════════════════════════════════════════════════
M9 — PRODUCT DNA (soul → design decisions)
═══════════════════════════════════════════════════════════════════

Use when: starting any product page/feature, before redesigns, before ads, or
on "understand the product first". Output feeds M7/M8/M10/M11.

## DNA extraction sheet (fill from brief/site/answers — keep ≤15 lines)
```
PRODUCT: name + category (one line)
JOB-TO-BE-DONE: when ___, the user wants ___, so they can ___
HERO USER: persona, context, sophistication level
DIFFERENTIATOR: the one thing competitors can't claim
PROOF: numbers / social / credentials available
EMOTION IN→OUT: user arrives feeling ___ → must leave feeling ___
FEEL-WORDS ×3
VOICE sliders 1–5: formal↔casual / serious↔playful / expert↔friendly / calm↔energetic
ANTI: what this product must NEVER look/sound like
PRICE FEEL: budget / fair / premium / luxury
```
Store as `PRODUCT_DNA.md` at repo root — future sessions read it instead of
re-asking (token saver).

## DNA → design decision matrix
| Signal | Consequence |
|---|---|
| emotion-out = confident | strong type contrast, decisive CTAs, stat blocks |
| emotion-out = calm | whitespace ↑, gentle springs, muted accent use |
| price = premium/luxury | fewer elements, serif/display moments, slower cinematic motion, grain/glass texture |
| price = budget/fair | density OK, clear comparison tables, snappy motion |
| sophistication = novice | progressive disclosure, plain labels, illustrations |
| sophistication = expert | density, keyboard affordances, data-forward |
| playful 4–5 | bouncy preset allowed beyond buttons, jester accents |
| serious 4–5 | spring overshoot ≤2%, no confetti ever |
| ANTI list | hard bans — check every screen against it |

## Voice → copy
Headline = differentiator in the user's words (≤8 words AR / ≤10 EN). Sub =
the JTBD sentence. CTA = verb+object tied to emotion-out ("Start learning with
confidence", not "Subscribe"). Microcopy obeys the sliders; error messages stay
caregiver-toned regardless.

## Feature presentation logic
Rank features by JTBD relevance, not org chart. Top feature = hero treatment
(demo/3D/animation). Next 3 = benefit-first cards (benefit headline, feature as
support). Rest = compact list. Every claim pairs with a PROOF item or gets cut.

## PEN's filled DNA (reference instance)
JTBD: "When I want a new skill in Arabic, I want world-class structured
learning, so I can progress with confidence" · Differentiator: authentic Arabic
+ artistic quality ("Learning as Art") · Emotion: scattered→confident&inspired ·
Feel: precise, warm, modern · Voice: 2-formal / 2-playful / 3-expert-friendly /
3-energy · ANTI: dry-academic look, literal translation, stock-photo feel ·
Price-feel: fair-premium.

═══════════════════════════════════════════════════════════════════
M10 — ADVERTISEMENT (product ad creative — EXPLICIT REQUEST ONLY)
═══════════════════════════════════════════════════════════════════

Trigger: user says ad/campaign/promo/إعلان. Never volunteer ads.
Prerequisite: PRODUCT_DNA.md (run M9 if missing — max 3 questions).

## Formats & specs
| Format | Size | Notes |
|---|---|---|
| Story/Reel | 1080×1920 | safe-zone: top 250px + bottom 320px UI-free |
| Feed square | 1080×1080 | text ≤20% of area feel |
| Feed portrait | 1080×1350 | best organic reach |
| Landscape/banner | 1920×1080 · 728×90 · 300×250 | web display |
| Hero/landing ad section | responsive | in-site promo |
Static → poster craft as HTML/CSS or canvas-rendered PNG. Motion ad → Remotion
composition (M6), 6/15/30s cuts.

## Hook formulas (first 1.5s / headline — pick by DNA voice)
Problem-jab ("Still learning from scattered videos?") · Bold claim+proof
("Master {skill} in 30 days — {proof}") · Curiosity gap ("The secret nobody
tells you about {topic}") · Identity call ("For every ambitious student…") ·
Before/after split visual · Social proof ("{n}+ students ahead of you").
Headline ≤8 words AR / ≤10 EN, benefit not feature. Display fonts allowed
(Rakkas/Zain via M2 ASK protocol — ads are their natural habitat).

## Layout formulas (static)
**Z-poster**: hook top (start-side per direction) → product visual center (3D
render/screenshot in glass frame + glow) → proof strip → CTA bottom-end.
**Split**: 50/50 problem (desaturated) / solution (full PEN gradient).
**Big-type**: typography IS the visual — Zain 'long'-axis stretched word + tiny
product chip. **UGC frame**: screenshot in device mock, casual caption type,
sticker badges.
Always: one focal point · brand mark in a corner (M7 export) · contrast ≥4.5 ·
CTA = filled pill, verb+object · price/offer in a burst badge only if real.

## Motion ad structure (Remotion, 15s @30fps)
```
0–45f    HOOK: big type spring-in word-by-word (4f stagger), dark bg + particles
45–210f  DEMO: 2–3 product shots — each: slide+settle 20f, hold 35f, feature
         caption types on (typewriter), cut on beat
210–315f PROOF: counter spring 0→{n} students + avatar row stagger
315–405f OFFER: price/badge pop (bouncy preset) + urgency line fade
405–450f CTA: logo draw-on (M7 entrance) + button pulse ×2 + URL
```
Audio ducking via volume interpolate. Captions always (sound-off default).
Loop trick for reels: last frame ≈ first frame.

## Ad copy rules
One idea per ad. Benefit verbs, zero buzzwords (M11 bans apply). CTA appears
twice in video (mid + end). Arabic ads written native, never translated from an
EN skeleton. Claims need a PROOF item from the DNA sheet or get rewritten softer.

## Variant protocol (always deliver)
≥3 variants with DIFFERENT hooks (not recolors) → label A/B/C with hook-type →
suggest the test metric (CTR for hooks, CVR for offers).

## Compliance
No fake countdowns, fabricated stats, or competitor names. Respect platform
text rules. Disclose "Ad/إعلان" where required.

═══════════════════════════════════════════════════════════════════
M11 — UI/UX LAW (priorities · bans · design verbs · anti-slop)
═══════════════════════════════════════════════════════════════════

## Direction-first (before ANY new UI)
Read the brief → NAME an aesthetic stance in one line (editorial-brutalist /
luxury-minimal / soft-tech / retro-future / industrial-utility /
PEN-house-style) → every later choice must defend that stance. No stance =
template slop. Memorability: ≥1 element the user recalls in 24h (signature
hero, type moment, interaction) — but exactly ONE thesis, no random decoration.
REDESIGN = audit-first: list 5 concrete flaws of the current UI (hierarchy,
contrast, density, motion, copy) → propose direction → build. Never blind.

## Priority ladder (resolve conflicts top-down)
1 **Accessibility** CRITICAL: contrast ≥4.5:1 body (3:1 large) incl.
placeholders · visible `:focus-visible` rings · alt text · aria-label on
icon-only buttons · tab order = visual order · label[for] on every input.
2 **Touch/Interaction** CRITICAL: targets ≥44px · tap (not hover) for primary
actions · disable buttons during async + spinner · errors adjacent to field ·
cursor-pointer on clickables.
3 **Performance** HIGH: WebP + srcset + lazy · reduced-motion · reserve space
for async content (no CLS) · skeletons >400ms.
4 **Layout/Responsive** HIGH: test 320/768/1024/1440 · body ≥16px mobile · no
horizontal scroll · semantic z-scale dropdown<sticky<modal-backdrop<modal<toast
<tooltip (never 999) · flex=1D, grid=2D · breakpointless grids
`repeat(auto-fill,minmax(280px,1fr))` · vary spacing for rhythm, never uniform
padding everywhere.
5 **Type/Color** MEDIUM → M2 + M1.
6 **Animation** MEDIUM → M3.
7 **States**: every view ships loading + empty (icon+title+line+action,
role=status) + error (recovery path) — a blank screen is a bug.

## Absolute bans (rewrite if reaching for these)
| Ban | Instead |
|---|---|
| side-stripe border-left/right >1px as accent | full border / bg tint / icon |
| identical card grids (cloned icon+heading+text) | vary sizes, list rows, prioritize content |
| eyebrow badge on every section | deliberate use, ≤2–3/page |
| 01/02/03 numbered markers as scaffolding | only for true sequences |
| border-radius ≥32px on cards/inputs | 16–20 max; full-pill = tags/badges only |
| 1px border + ≥16px-blur shadow on same element | pick one (shadow ≤8px) |
| diagonal stripe backgrounds | solid surfaces or purposeful PEN gradient |
| text overflowing at any breakpoint | tighten clamp / rewrite copy |
PEN exceptions (identity wins): gradient text on heroes/highlights · glass on
feature + teacher cards · eyebrows on major sections.

## 12 design verbs (scoped passes — apply on request, e.g. "make it bolder")
Bolder (↑contrast/weight/scale) · Quieter (strip to essentials) · Distill
(merge, cut 30% of elements) · Polish (alignment, optical spacing, shadow
tuning) · Typeset (type-only pass) · Colorize (palette pass) · Layout
(restructure grid) · Adapt (responsive pass) · Animate (motion pass via M3) ·
Delight (one surprise micro-moment) · Overdrive (maximal hero treatment) ·
Freeform (explore 3 directions). A verb = a scoped pass; touch nothing outside
its lane.

## Copy rules
Every word earns its place; no heading-echo intros. NO em dashes (use commas,
colons, semicolons, parentheses). Banned buzzwords: streamline / empower /
supercharge / leverage / seamless / world-class / next-generation /
game-changer (and their Arabic equivalents). Buttons: verb+object ("Save
changes", not "OK"). Links carry standalone meaning ("View course catalog",
not "Click here"). No all-caps body. Arabic copy written native, never a
translated English skeleton.

## "AI-made" test (final gate — any YES = fix before shipping)
Hero clamp >6rem? Tracking <−0.04em? Eyebrow on every section? Cloned glass
grid? Gray body <4.5:1? Bounce easing on content reveals? Missing empty state?
Inter/Roboto crept in? Same radius everywhere? Everything centered in one
column?

## Variant discipline
Ambiguous direction → produce 3 SMALL variants (hero-only or component-only),
each labeled with its stance → user picks. Cheaper than 3 full pages. Lock the
winner in PROJECT_MAP.md under `## design-direction`.

═══════════════════════════════════════════════════════════════════
M12 — ARCHITECTURE (components · state · a11y · structure)
═══════════════════════════════════════════════════════════════════

## Composition over configuration
```tsx
// ✅ <Card><CardHeader/><CardBody/></Card>
// ❌ <Card title headerVariant bodyPadding content/>
```
Container (fetch + loading/error/empty) vs Presentation (pure render) —
separate. Children/slots > boolean-prop explosions. Polymorphic `as` prop for
semantics.

## State ladder (simplest that works — climb only when forced)
```
useState → lifted (2–3 siblings) → Context (theme/auth/locale, read-heavy) →
URL params (filters/pagination/shareable) → React Query (server cache) →
Zustand (complex shared client state)
```
Prop-drilling >3 levels = restructure. Server state ≠ client state — never
mirror fetch results into useState; let React Query own it. Derive, don't
store: computed values via useMemo, not duplicate state.

## Effects discipline (the bug factory)
useEffect ONLY for external-system sync (DOM APIs, subscriptions, timers). Data
transforms → render-time/useMemo. Event logic → handlers. Every effect:
exhaustive deps + cleanup return. Race-proof fetches: AbortController or an
ignore-stale flag. No setState loops (an effect setting its own dependency).

## TypeScript guards
No `any` (unknown + narrowing). Discriminated unions for variant props.
`satisfies` for config objects. Event types from React, not DOM globals.
Exported components: explicit Props interface; JSDoc the non-obvious.

## WCAG 2.1 AA essentials
Semantic HTML first (button/nav/main/dialog) before role=. Icon-only →
aria-label. Inputs → label[for]. Focus: move on content change (modal open →
inside; close → back to trigger), trap inside modals, restore on unmount. Live
regions: role=status for async results; aria-live=assertive for errors only.
Keyboard: everything operable; Escape closes layers; arrow keys in menus/tabs
(roving tabindex).

## Responsive contract
Test 320·768·1024·1440. Mobile-first media queries. Container queries
(`@container`) for embedded components. clamp() fluid type within M11 caps.
Logical properties for RTL (M2).

## Red flags — never ship
Component >200 lines (split it) · arbitrary px outside the token scale ·
missing loading/error/empty · no keyboard path · inline styles violating PEN
tokens (project uses inline styles BUT values must come from the token scale) ·
fetch in a component without abort/cache strategy · index-as-key on dynamic
lists · new dependency unannounced.

## File conventions
Component file order: types → component → subcomponents → hooks → helpers
(top-down readable). Hooks in lib/ or co-located use*.ts. One component per
file when >40 lines. Barrel exports only at feature boundaries.

═══════════════════════════════════════════════════════════════════
M13 — QUALITY (zero-bug protocol · motion-perf audit · ship gates)
═══════════════════════════════════════════════════════════════════

## Find→Fix loop (anything broken/janky/slow)
1 REPRODUCE: exact steps, viewport, state. Can't reproduce → instrument
(console.count, performance marks); never guess-patch.
2 ISOLATE: binary-search the cause (comment halves / git-bisect mindset).
3 ROOT CAUSE in one sentence before touching code. Symptom-patches banned.
4 FIX with the smallest diff at the root.
5 VERIFY: original repro passes + neighbors unaffected + console clean.
6 RECORD: one line in PROJECT_MAP.md under `## fixes` (date · cause · file) —
future sessions read this instead of re-debugging (token saver).

## Motion-performance audit (run on any animation complaint)
Per animated element:
- **Compositor-only?** transform/opacity/filter ONLY. width/height/top/left/
  margin/padding = layout thrash → rewrite to transform.
- **Read/write mixed?** getBoundingClientRect/offsetWidth in the same frame as
  style writes = forced reflow. Batch: read all → write all (or split across
  rAF). Loops measuring per item = top jank source.
- **Blur abuse?** backdrop-filter/filter:blur on large or MANY elements kills
  paint. Cap blur ≤24px, ≤3 glass layers visible, never animate blur radius on
  big surfaces (animate the opacity of a pre-blurred layer instead).
- **will-change**: only on elements about to animate; remove after; never
  global. Too many = memory blowup.
- **Scroll-linked**: passive listeners; do work inside a rAF tick reading a
  cached scrollY; prefer IntersectionObserver / animation-timeline over scroll
  handlers.
- **Single rAF**: multiple loops → merge into one ticker.
- **Paint area**: huge animating box-shadows = repaint storms → pre-render the
  shadow layer, animate its opacity.
DevTools proof: Performance panel shows no red Long Tasks during animation;
animated element on its own layer; FPS ≥55 desktop / ≥30 at 4× CPU throttle.
Don't migrate animation libraries to "fix" perf — fix within the existing stack.

## Ship gates (run before "done" — ALL must pass)
```
□ console: zero errors/warnings (incl. React keys, act, hydration)
□ TS: no any-creep, clean build
□ states: loading/empty/error rendered & styled
□ a11y quick-pass: tab through page, focus visible, Escape works, axe: no criticals
□ RTL + LTR both eyeballed · 320px: no overflow
□ reduced-motion: page fully usable, content visible
□ network: no failed requests; images sized (no CLS)
□ Hard Rules (CORE 🔒) untouched — grep t( · hrefs · API_BASE in touched files
□ memory: unmount page → no rAF/listener leaks (Performance monitor steady)
```

## Common PEN footguns (check first)
Reveal class never fires on SSR/hidden tab → content invisible (M3 rule). RTL
translateX sign. Three.js scene not disposed on route change. IO observing
detached nodes after re-render. Inline-style transition overwritten by a hover
handler (style-attribute specificity). Cairo FOUT → preload. Zain VF axis typo
('long', exact lowercase).

## Performance budget recap
LCP <2.5s · CLS <0.1 · INP <200ms · hero JS <180KB gz · preload only above-fold
woff2 · 3D budgets in M5.

═══════════════════════════════════════════════════════════════════
APPENDIX — Source integration map (what was merged from where)
═══════════════════════════════════════════════════════════════════
graphify → modular routing + PROJECT_MAP query-first protocol · caveman →
compressed telegraphic style + output discipline · Cursor → read-before-edit,
smallest-diff protocol · Composio → JIT context principle · Obsidian skills →
markdown project memory (PROJECT_MAP/PRODUCT_DNA/fixes log) · motion.dev →
M3 Motion API · Emil Kowalski → M3 taste law · 12-principles (ui-skills) → M3 ·
fixing-motion-performance (ibelick) → M13 audit · pseudo-elements → M4 ·
threejs-animation/interaction → M5 · remotion-best-practices → M6 ·
interaction-design (wshobson) → M4 law · canvas-design (Anthropic) → M10
poster craft · design-lab → M11 variants · Spline/Hana → M4 + M5 ·
animate-ui → M3 recipes · 21st.dev → M5 hero recipes · impeccable → M11 bans +
12 verbs + AI-made test · taste-skill → M11 direction-first + audit-first ·
ui-ux-pro-max → M11 priority ladder · frontend-ui-engineering (upgraded) → M12 ·
Claude interactive mark → M7 radial-burst family · uploaded Arabic fonts +
Rubik/Noto Serif → M2 vault.
