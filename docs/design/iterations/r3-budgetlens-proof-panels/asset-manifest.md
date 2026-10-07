# BudgetLens r3 asset manifest

## Original target assets

| Path | Source and rights | Role | Dimensions | Notes |
|---|---|---|---:|---|
| `web/public/brand/budgetlens-mark.svg` | Original project-owned SVG authored for BudgetLens | Header, footer, favicon | 48 × 48 viewBox | Page outline and one selected line; no text in the mark. Wordmark stays live text. |
| `web/public/images/budgetlens-evidence-layers.png` | Generated with OpenAI image generation for this project; no external source or sample image | Home hero artwork | 1448 × 1086, transparent PNG | Three paper sheets and a magnifier. Its chart strokes are decorative, not budget data. |
| `web/public/images/budgetlens-report-folder.png` | Generated with OpenAI image generation for this project; no external source or sample image | Upload route illustration | 1122 × 1402, transparent PNG | Folder and paper illustration. Its strokes are decorative, not a real report. |

### Prompt for `budgetlens-evidence-layers.png`

Create a transparent editorial still life for a public-budget reading product: exactly three overlapping ivory paper sheets and one forest-green magnifying glass, three-quarter top-down angle, paper grain, clean upper-left contact shadow, landscape 4:3, objects centered toward the right with left negative space. Show only abstract chart strokes and one small lime accent. No words, digits, logos, seals, flags, currency symbols, people, coins, devices, UI, glow, or gradients. Use forest `#163300`, lime `#9fe870` sparingly, paper, sage, and a small teal detail. Keep it crafted and editorial rather than a generic AI render.

### Prompt for `budgetlens-report-folder.png`

Create a transparent portrait 4:5 paper collage in the same editorial style: exactly one deep-forest folder, one ivory report sheet partly sliding out, and one small muted-orange archival tab. Three-quarter top-down angle; layered paper edges; upper-left contact shadow; folder low and right with clear space above. The sheet may show a few nonverbal horizontal rules and a short abstract chart stroke. No text, digits, tables, marks, seals, currency, people, circles, magnifier, coins, UI, glow, or gradients. Use ivory, forest `#163300`, restrained lime `#9fe870`, sage, and one small orange detail.

## Reference capture

| Path | Source | Rights and use |
|---|---|---|
| `docs/design/evidence/source/restate-home-1402x876.png` | Browser capture of `https://restate.dev/`, 6 October 2026 | Retained as private design-study evidence. Do not publish as a BudgetLens asset or copy its marks, text, or artwork. |

## Font and code sources

- Inter: Google Fonts stylesheet; open-source font family under SIL Open Font License. Verify the browser-loaded face in the target before calling the font check complete.
- No external component code, images, or logos were copied. Existing Vue components and native HTML controls are reused.
