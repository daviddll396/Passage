# BudgetLens direction r3: source proof panels

- **Revision:** `r3-budgetlens-proof-panels`
- **Parent:** `r2-budgetlens`
- **Status:** Build under the user's scoped review waiver.
- **Rationale:** Replace the current small, repetitive card interface with a confident, editorial product surface that puts real source data, cited answers, and privacy details in the first read.
- **Required decision:** The user asked for a full redesign, original logo and useful imagery, and no pulsing status circles or generic AI decoration. The existing direct-build instruction waives a mockup-first pause for this scope.

## Vibe and target anchor

BudgetLens should feel like an independent public-finance journal with the clarity of a technical product. The main visual anchor is an actual report value paired with its source. The interface moves from statement, to published number, to report passage, to AI answer. Large Inter Black headlines create the first read; small metadata stays secondary and never carries the only explanation. The forest and lime system from the user's Wise reference remains, on warm paper and restrained fog surfaces.

## References and transferred relationships

### Primary: Restate homepage

- **Source:** `https://restate.dev/`
- **Evidence:** `docs/design/evidence/source/restate-home-1402x876.png`, desktop first view, 1280 × 800 capture, 6 October 2026. A cookie consent panel and announcement strip were visible in the capture.
- **Observed:** Compact dark rounded navigation; one large, centered two-line technical headline; short centered explanation; a clear primary and secondary action; customer marks below; an illustrated field along the lower edge. The page alternates bold headline space with structured product evidence further down.
- **Effect:** The headline explains the product before the visitor studies its details. The technical surface below gives the headline a concrete product context.
- **Cause hypothesis:** Large type and a narrow supporting measure make the message dominant; the dark navigation isolates the control row; product-specific proof follows instead of more marketing copy.
- **Transfer:** Keep one direct headline, a concise explanation, two clear actions, and a strong product proof view in the opening section. Use verified report values and the official source in place of customer logos. Build lower sections from source, question, and evidence.
- **Break condition:** Customer logos would falsely suggest BudgetLens customers or endorsements. Restate's blue identity, exact centered composition, site copy, illustrations, and assets do not transfer. Its observed mobile layout, exact font, and motion are unknown. Its vertical page dots are deliberately excluded.

### Supporting: local composition `brand-composition-01.png`

- **Observed:** Oversized statement and a single large object occupy separate quiet zones inside a restrained border.
- **Transfer:** Give the headline and generated document art distinct space; let one real data card overlap the art only where the live copy remains readable.
- **Substitutions:** Inter replaces the reference serif; BudgetLens forest, lime, paper, and a generated report illustration replace its gold palette and chess object.
- **Reject:** The chess object, logo, serif face, gold frame, grain treatment, and source copy.

### Supporting: local composition `brand-composition-03.png`

- **Observed:** Repeated campaign panels keep a consistent hierarchy while varying imagery and layout.
- **Transfer:** Keep report cards consistent in source, period, figure, and action order without forcing the library into identical empty columns.
- **Reject:** Poster artwork, photographic architecture, dot texture, and the source identity.

## Component donors

- **Navigation and opening hierarchy:** Restate homepage, adapted as a visual pattern only; no code, copy, mark, or asset is reused.
- **Report record card:** Existing `BudgetReportCard.vue`, whose hierarchy was adapted from the free Career1 listing pattern in [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career). Reuse and refine the existing Vue component; no external code or artwork is copied.
- **Answer and evidence:** The user-supplied streaming-answer example from this conversation. Reuse its answer, source, and follow-up hierarchy as a static result state; no demo answer or sample source is used.
- **PDF selection:** Existing native file input and drag/drop behavior. Keep the browser control and refine its visible state.
- **Resource fit:** The repo contains Nuxt/Vue and no React component library. The component catalog's React-only animated libraries do not fit this app; add no dependency.
- **Visual prompt check:** The Builda OnePrompt Design category was checked for a matching Free Use prompt. Search returned no matching result, so the custom prompts are recorded in `asset-manifest.md`.

## Target system

- **Palette:** Forest Ink `#163300`, Lime Voltage `#9fe870`, Spruce `#054d28`, Paper `#ffffff`, Fog `#e8ebe6`, Charcoal `#454745`, Obsidian `#0e0f0c`, and warm page paper `#f7f8f3`. Lime is used sparingly for the primary action and selected evidence detail.
- **Typography:** Inter 400, 500, 600, 700, and 900. Use Inter Black for primary titles, Inter 600–700 for section titles, and Inter 400–500 for body and report values. Fall back to the system sans stack.
- **Spacing and shape:** 4px rhythm; 1200px content width; comfortable section spacing; 12px information panels; 24px hero/closing panels; pill controls only where the action or tag needs them.
- **Media:** Two original transparent editorial paper illustrations, generated for BudgetLens and documented in `asset-manifest.md`. They are decorative and contain no real report data. Live report values remain HTML text from the API.
- **Logo:** Original SVG page mark with one highlighted source line; wordmark remains live text. See `web/public/brand/budgetlens-mark.svg`.
- **Motion eligibility:** Static layout with small interaction transitions only. Hover and pressed feedback changes color or border, never layout. Loading states stay static. Reduced motion disables smooth anchor scrolling and transitions.

## Page contracts

- **Home:** Compact dark nav; single strong statement; live featured report proof made from API values; two direct actions; a plain source-to-question-to-evidence explainer; flexible report library; one dark upload callout.
- **Report detail:** Source and period first; published figures and evidence remain distinct from Gemini answers; Q&A citations label document pages or listing metadata accurately.
- **Upload:** Explain private temporary handling before selection; show a large native PDF drop area; preserve file validation, extraction, privacy, report results, evidence, and grounded questions.
- **Responsive:** Wide split hero and two-column report/upload surfaces collapse to one column around content-fit widths. The document artwork becomes non-overlapping, the proof card returns to normal flow, and values never require horizontal scrolling.

## Rejected patterns

- Pulsing or blinking circles, fake online states, status-dot rows, shimmer loaders, ambient moving blobs, scroll-linked motion, or floating decorative UI.
- Dense rows of tiny all-caps metadata, repeated icon cards, unsupported customer logos, invented report values, and generic AI sparkle marks.
- Restate's colors, exact page geometry, copied graphics, logos, typography files, code, and marketing text.
- Arrows added as decoration to every button; directional arrows remain only when they clarify navigation.

## Assets and evidence

- Original generated art and the SVG logo: `asset-manifest.md`.
- Source capture: `docs/design/evidence/source/restate-home-1402x876.png`.
- Target browser evidence will be added after the implementation at desktop and phone sizes. This pass intentionally does not create or present mockups because the user has already waived mockup-first review.
