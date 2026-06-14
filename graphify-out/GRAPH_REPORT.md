# Graph Report - .  (2026-06-14)

## Corpus Check
- 70 files · ~137,225 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 348 nodes · 722 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.89)
- Token cost: 18,000 input · 4,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard UI Components|Dashboard UI Components]]
- [[_COMMUNITY_Islamic Remembrance (Adhkar)|Islamic Remembrance (Adhkar)]]
- [[_COMMUNITY_Branding & 3D Background|Branding & 3D Background]]
- [[_COMMUNITY_Design System & Brand Docs|Design System & Brand Docs]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_3D Scene & Particles|3D Scene & Particles]]
- [[_COMMUNITY_Prayer Time Notifications|Prayer Time Notifications]]
- [[_COMMUNITY_Focus Timer|Focus Timer]]
- [[_COMMUNITY_App Shell & Layout|App Shell & Layout]]
- [[_COMMUNITY_3D Icon Library|3D Icon Library]]
- [[_COMMUNITY_Analytics & History|Analytics & History]]
- [[_COMMUNITY_Logo SVG Visual Components|Logo SVG Visual Components]]
- [[_COMMUNITY_Logo Reference Image|Logo Reference Image]]
- [[_COMMUNITY_Approved Logo Identity|Approved Logo Identity]]
- [[_COMMUNITY_Hero Section|Hero Section]]
- [[_COMMUNITY_Font Subsetting|Font Subsetting]]
- [[_COMMUNITY_Design Skill Archive|Design Skill Archive]]

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 52 edges
2. `glyph()` - 43 edges
3. `useAuth()` - 37 edges
4. `db` - 12 edges
5. `Web Genesis Skill (SKILL.md)` - 10 edges
6. `DashboardPage()` - 9 edges
7. `getTodayKey()` - 8 edges
8. `Mizan Project Map` - 8 edges
9. `Mizan Logo Vectorized SVG` - 8 edges
10. `Stop Slop Skill (Core Rules)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Mizan Call Flow HTML Export` --conceptually_related_to--> `Mizan Project Map`  [INFERRED]
  callflow-mizan.html → PROJECT_MAP.md
- `Al Jazeera Arabic Font (body/UI)` --conceptually_related_to--> `Bilingual AR/EN Full RTL Design`  [INFERRED]
  MEMORY.md → PRODUCT_DNA.md
- `Palestine Font (wordmark + AR h1)` --conceptually_related_to--> `Bilingual AR/EN Full RTL Design`  [INFERRED]
  MEMORY.md → PRODUCT_DNA.md
- `Mizan Project Memory Log` --implements--> `File Over App Memory Protocol`  [INFERRED]
  MEMORY.md → SKILL.md
- `Mizan Project Memory Log` --references--> `Mizan Product DNA`  [INFERRED]
  MEMORY.md → PRODUCT_DNA.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Mizan Brand Identity System (palette + mark + fonts + direction)** — concept_midnight_fajr_palette, concept_mizan_mark, concept_palestine_font, concept_aljazeera_font, concept_calm_precise_spiritual_tech [INFERRED 0.85]
- **Stop Slop Skill System (SKILL + phrases + structures + examples)** — stop_slop_skill, stop_slop_phrases, stop_slop_structures, stop_slop_examples [EXTRACTED 1.00]
- **Mizan Persistent Memory System (MEMORY + PROJECT_MAP + PRODUCT_DNA)** — mizan_memory, mizan_project_map, mizan_product_dna [INFERRED 0.85]

## Communities (19 total, 3 thin omitted)

### Community 0 - "Dashboard UI Components"
Cohesion: 0.07
Nodes (43): glyph(), StatsBar(), DUR_HOURS, DUR_MINS, DurationPicker(), fmt12h(), fmtTimer(), HOURS (+35 more)

### Community 1 - "Islamic Remembrance (Adhkar)"
Cohesion: 0.08
Nodes (34): AdhkarSection(), EVENING_ADHKAR, MORNING_ADHKAR, SETS, DHIKR_LIST, DhikrSection(), MAP, MizanMosque() (+26 more)

### Community 2 - "Branding & 3D Background"
Cohesion: 0.08
Nodes (24): Logo(), Mizan3DBackground(), ParticleSystem, loadPagesRead(), QuranReader(), savePagesRead(), todayKey(), BLANK (+16 more)

### Community 3 - "Design System & Brand Docs"
Cohesion: 0.10
Nodes (35): Mizan Call Flow HTML Export, AI Writing Patterns (Slop), Al Jazeera Arabic Font (body/UI), GLSL Aurora Shader Background, Bilingual AR/EN Full RTL Design, Binary Contrast Patterns, Calm-Precise Spiritual-Tech Design Direction, False Agency (inanimate subjects) (+27 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.07
Nodes (29): dependencies, date-fns, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, firebase, lucide-react, motion (+21 more)

### Community 5 - "3D Scene & Particles"
Cohesion: 0.11
Nodes (17): ParticleSystem, PRAYER_ICON, prayerGlyph(), PRAYER_ENTRIES, PrayerTimesWidget(), AppContext, FIXED_SECTIONS, OBLIGATORY_PRAYER_IDS (+9 more)

### Community 6 - "Prayer Time Notifications"
Cohesion: 0.14
Nodes (19): AdhanNotifier(), ALL_TIMED, loadPlayed(), OBLIGATORY, PRAYER_LABELS, PRAYER_TIME_KEY, savePlayed(), todayKey() (+11 more)

### Community 7 - "Focus Timer"
Cohesion: 0.16
Nodes (15): DEFAULT_MINUTES, FocusTimer(), loadCustomMinutes(), MODES, COLOR_MAP_DB, DashboardPage(), FULL_DAYS_DB, localDateStr() (+7 more)

### Community 8 - "App Shell & Layout"
Cohesion: 0.18
Nodes (10): Layout(), MizanMark(), useScrollReveal(), FEATURE_ROWS, FEATURED, item, LandingPage(), STATS (+2 more)

### Community 9 - "3D Icon Library"
Cohesion: 0.23
Nodes (6): Canvas3DIcon(), Analytics3D(), BookRead3D(), FocusTimer3D(), PrayerBeads3D(), TaskCheckmark3D()

### Community 10 - "Analytics & History"
Cohesion: 0.22
Nodes (10): DayHistoryPage(), hijri(), keyOf(), MonthCard(), MONTHS_AR, MONTHS_EN, pad(), todayKey() (+2 more)

### Community 11 - "Logo SVG Visual Components"
Cohesion: 0.42
Nodes (9): Scale Base/Pedestal Shape, Central Pillar/Column Shape, Mizan Logo Color Palette (near-white + neutral grays), Inner Circle/Compass Details, Left Scale Pan Shape, Mizan App Brand Identity, Right Scale Pan Shape, Mizan Balance Scale Symbol (+1 more)

### Community 12 - "Logo Reference Image"
Cohesion: 0.33
Nodes (7): Balance / Equilibrium Metaphor, Gold Material / Finish, Golden Balance Scale Object, Justice / Law Symbol, Mizan (Arabic: Scale/Balance), Product Logo / Brand Reference Asset, Scales of Justice (Balance Scale)

### Community 13 - "Approved Logo Identity"
Cohesion: 0.60
Nodes (6): Balance Scales Visual Element, Logo Concept B (Approved), Mihrab Arch Shape (محراب التوازن), Mizan Brand Identity, Mizan Brand Color: Orange (#fb4604), Mizan Icon SVG (Favicon)

## Knowledge Gaps
- **95 isolated node(s):** `name`, `private`, `version`, `type`, `node` (+90 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useApp()` connect `Branding & 3D Background` to `Dashboard UI Components`, `Islamic Remembrance (Adhkar)`, `3D Scene & Particles`, `Prayer Time Notifications`, `Focus Timer`, `App Shell & Layout`, `Analytics & History`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `glyph()` connect `Dashboard UI Components` to `Islamic Remembrance (Adhkar)`, `Branding & 3D Background`, `Prayer Time Notifications`, `Focus Timer`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Islamic Remembrance (Adhkar)` to `Dashboard UI Components`, `Branding & 3D Background`, `3D Scene & Particles`, `Prayer Time Notifications`, `Focus Timer`, `App Shell & Layout`, `Analytics & History`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _95 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07227891156462585 - nodes in this community are weakly interconnected._
- **Should `Islamic Remembrance (Adhkar)` be split into smaller, more focused modules?**
  _Cohesion score 0.0782608695652174 - nodes in this community are weakly interconnected._
- **Should `Branding & 3D Background` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._