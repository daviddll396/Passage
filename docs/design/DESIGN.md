# BudgetLens interface contract

## Product and audience

- **Purpose:** Help people read public budget reports, inspect reported figures, and ask questions grounded in the source text.
- **Audience:** People who need to understand budget documents without reading every page.
- **Primary actions:** Open a public report or upload a PDF for private analysis.
- **Current design revision:** `r3-budgetlens-proof-panels`.
- **Design gate:** `docs/design/design-gate.json`.
- **Source study:** `docs/design/study.md`.
- **Review scope:** The user waived mockup-first review and authorized direct implementation for this scope. The waiver is recorded against the current revision in the gate.
- **Stack:** Existing Nuxt 3 and Vue app with the existing Express API. Do not migrate the stack.

## Fixed invariants

- Show verified public report values with their source.
- Keep published figures visually separate from AI answers.
- Ground AI answers in report evidence and abstain when the report is silent.
- Label document-page citations and report-listing metadata accurately.
- Keep user-uploaded PDF files private and temporary. The API sends PDF bytes to Gemini for extraction, then discards the file; extracted data and its questions expire after 30 minutes.
- Preserve the existing API paths, request payloads, upload limits, and report behavior.

## Brand anchor

- **Vibe:** Confident public-finance journal with the clarity of a technical product. Direct, source-first, and readable; avoid the generic startup dashboard look.
- **Palette:** Forest Ink `#163300`, Lime Voltage `#9fe870`, Spruce `#054d28`, Linen Mist `#e2f6d5`, Paper `#ffffff`, Fog `#e8ebe6`, Charcoal `#454745`, Obsidian `#0e0f0c`, and page paper `#f7f8f3`. Forest leads; lime is a restrained action and evidence accent.
- **Type:** Inter variable, weights 400–900, with the system sans stack as fallback. Use weight 800–900 and tight tracking for page titles, 600–800 for section labels, and 400–600 for body and values. The Google Fonts response must be verified in the browser.
- **Logo:** Original 48px SVG page mark with one highlighted source line; the BudgetLens wordmark stays live text. File: `web/public/brand/budgetlens-mark.svg`.
- **Shape:** 12–16px information panels, 22–26px feature panels, pill buttons and tags where their role benefits from a compact shape, hairline borders, no decorative shadow stack.
- **Imagery:** Two generated paper illustrations support the hero and upload explanation. Their chart strokes are abstract decoration; all real figures remain HTML data from the API. Paths and prompts are in `docs/design/iterations/r3-budgetlens-proof-panels/asset-manifest.md`.
- **Motion:** Static layout with short color and border transitions for hover/focus. No scroll-linked animation, pulsing indicators, shimmer, or floating decoration. Reduced motion disables smooth anchor scrolling and transitions.

## Layout and page behavior

### Home

- Use a compact forest navigation capsule.
- Lead with one direct statement and one short product explanation.
- Pair the headline with the generated paper illustration and a proof panel built from the featured report returned by the API.
- The proof panel may show its actual title, source, period, first metric, unit, and page label. Never hard-code a sample value.
- Replace customer-logo claims with factual product properties: source-linked figures, evidence-backed answers, and private uploads.
- Explain the source → question → evidence path, then show flexible report records.
- Finish with one focused PDF-analysis action.

### Report detail

- Show the source name, report title, period, and original-source link first.
- Separate report figures, source passages, and AI answers into distinct surfaces.
- Keep report-page labels visible when supplied. Never present report metadata as a quoted page passage.
- Ask Gemini only after the user submits a question. Keep answer, citation, abstention, and error states readable and grounded.

### PDF upload

- Explain privacy and session expiry before file selection.
- Keep the native PDF input, drag/drop, PDF validation, 8 MB limit, extraction action, and restart behavior.
- Keep upload results, extracted figures, source passages, and Q&A in the same source-first visual system.
- Show that uploaded PDFs are sent to Gemini, discarded by BudgetLens, and not added to the public library.

### Responsive and accessible behavior

- Content max-width: 1280px, with page gutters that step from 32px to 24px to 18px as space narrows.
- Collapse the home hero, report details, and upload layout at their actual content-fit widths. Use normal document flow on phones; the hero artwork returns to its own row and the proof panel does not cover it.
- Long source names and numeric values wrap without horizontal scrolling.
- Use semantic headings, links, buttons, forms, labels, `aria-live` for returned answers and loading/errors, visible keyboard focus, and non-color-only status. The hidden file control remains keyboard-operable through its labeled drop area.

## Component donors and reuse

- The Restate homepage contributes headline-first hierarchy, a short supporting message, a clear action pair, and product proof below the headline. Its code, copy, logo, colors, marks, and art are not reused.
- `BudgetReportCard.vue` reuses the existing Vue record-card component and refines the earlier Career1 listing-pattern adaptation from [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career). No external component code is copied.
- `BudgetQuestion.vue` reuses the answer, citation, and follow-up hierarchy from the user-supplied streaming-answer example, with real API output only.
- The upload keeps the native file input and existing API state flow. No component or animation dependency is added.
- Component-source selection and reuse notes are in `docs/design/iterations/r3-budgetlens-proof-panels/direction.md`.

## Rejected patterns

- Pulsing circles, online/status dots, shimmer loaders, floating shapes, unnecessary gradients, generic AI sparkles, and decorative motion.
- Repeated rows of tiny labels or icon cards where a clear source/value hierarchy is stronger.
- Invented figures, customer logos, unsupported causal claims, or uploaded documents presented as official.
- Restate branding, assets, text, source code, or exact composition.
- Decorative northeast arrows on actions; directional arrows remain only when they clarify navigation.
