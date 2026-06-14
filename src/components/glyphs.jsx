import {
  Flame, Star, BarChart3, Target, Trophy, Swords, Rocket, PartyPopper, ArrowUp,
  Calendar, CalendarDays, ClipboardList, Bell, Timer, BookOpen, Search, Pencil,
  Upload, Scale, Sparkles, CheckCircle, HeartHandshake, Sunrise, Quote, Sprout, Zap,
  Sun, Moon, BookOpen as Quran,
} from 'lucide-react'
import MizanMosque from './MizanMosque'

// Semantic name → icon. Replaces the old UI emoji with monochrome lucide line
// icons (or the hand-drawn mosque) that inherit currentColor like the prayer
// glyphs. Render via `glyph('streak')` (element-in-data) or `glyph('bell', 14)`.
const MAP = {
  mosque: MizanMosque, prayers: MizanMosque,
  streak: Flame, points: Star, productivity: BarChart3, tasks: CheckCircle, check: CheckCircle,
  target: Target, trophy: Trophy, swords: Swords, rocket: Rocket,
  party: PartyPopper, levelup: ArrowUp,
  calendar: Calendar, calendarDays: CalendarDays, clipboard: ClipboardList,
  bell: Bell, timer: Timer, book: BookOpen, search: Search, pencil: Pencil,
  upload: Upload, scale: Scale, sparkle: Sparkles, dua: HeartHandshake, sunrise: Sunrise, quote: Quote,
  sprout: Sprout, zap: Zap, sun: Sun, moon: Moon, quran: Quran,
}

export function glyph(name, size = '1em') {
  const Icon = MAP[name] || Sparkles
  return <Icon size={size} aria-hidden="true" style={{ verticalAlign: '-0.125em', flexShrink: 0 }} />
}

export { MizanMosque }
