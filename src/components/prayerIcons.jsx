import {
  Sunrise, SunMedium, Sun, CloudSun, Sunset, Moon, MoonStar,
} from 'lucide-react'

/**
 * Prayer → lucide glyph. Replaces the old multicolour emoji with monochrome
 * line icons that inherit the surrounding text colour (crimson, via
 * currentColor). `size="1em"` makes each glyph scale to its container's
 * font-size, so the existing `{x.icon}` render sites keep their original
 * sizing with no markup changes.
 */
const PRAYER_ICON = {
  fajr:    Sunrise,
  duha:    SunMedium,
  dhuhr:   Sun,
  asr:     CloudSun,
  maghrib: Sunset,
  isha:    Moon,
  witr:    MoonStar,
}

export function prayerGlyph(id) {
  const Icon = PRAYER_ICON[id] || Sun
  return (
    <Icon size="1em" aria-hidden="true" style={{ verticalAlign: '-0.125em', flexShrink: 0 }} />
  )
}
