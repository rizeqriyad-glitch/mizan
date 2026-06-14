// Subset the local Arabic fonts to woff2 (harfbuzz keeps GSUB/GPOS — Arabic
// joining survives; this replaces the pyftsubset --layout-features='*' step).
// Run: node scripts/subset-fonts.mjs
import { readFile, writeFile } from 'node:fs/promises'
import subsetFont from 'subset-font'

const ranges = [
  [0x0020, 0x007e], // basic Latin (digits, punctuation, embedded EN)
  [0x00a0, 0x00a0],
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0x0660, 0x0669], // Arabic-Indic digits (inside 0600 block, kept explicit)
  [0x2010, 0x2027], // dashes, quotes, ellipsis
  [0x20ac, 0x20ac],
]
let text = ''
for (const [a, b] of ranges)
  for (let c = a; c <= b; c++) text += String.fromCodePoint(c)

const jobs = [
  ['palestine.otf', 'palestine.woff2'],
  ['aljazeera-light.ttf', 'aljazeera-light.woff2'],
  ['aljazeera-regular.ttf', 'aljazeera-regular.woff2'],
  ['aljazeera-bold.ttf', 'aljazeera-bold.woff2'],
]

for (const [src, out] of jobs) {
  const buf = await readFile(new URL(`../public/fonts/${src}`, import.meta.url))
  const woff2 = await subsetFont(buf, text, { targetFormat: 'woff2' })
  await writeFile(new URL(`../public/fonts/${out}`, import.meta.url), woff2)
  console.log(`${src} ${(buf.length / 1024).toFixed(0)}KB -> ${out} ${(woff2.length / 1024).toFixed(0)}KB`)
}
