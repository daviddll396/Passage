# Passage interface contract

## Product and audience

- **Purpose:** Help people understand PDFs, ask questions, and check answers against source passages.
- **Audience:** People who need clear answers from long documents.
- **Primary actions:** Try a published example or upload a PDF for private analysis.
- **Current design revision:** `r5-passage`.
- **Design gate:** `docs/design/design-gate.json`.
- **Source study:** `docs/design/study.md`.
- **Review scope:** The user waived mockup-first review and authorized direct implementation for this scope. The waiver is recorded against the current revision in the gate.
- **Stack:** Existing Nuxt 3 and Vue app with the existing Express API. Do not migrate the stack.

## Fixed invariants

- Keep source data visually separate from AI answers.
- Ground AI answers in page evidence and abstain when the document is silent.
- Label document-page citations and source-listing metadata accurately.
- Keep user-uploaded PDF files private and temporary. The API sends PDF bytes to Gemini for extraction, then discards the file; extracted data and its questions expire after 30 minutes.
- Preserve the existing API paths, request payloads, upload limits, and sample library behavior.

## Brand anchor

- **Vibe:** Airy document editorial with a clear product interface. Use confident geometric headings, thin rules, warm paper surfaces, and real source data.
- **Palette:** Warm paper `#faf7f2`, navy ink `#20283d`, indigo `#34395f`, coral `#ef8b70`, periwinkle, and muted slate. Do not use green.
- **Type:** Space Grotesk for headings and DM Sans for controls and body copy.
- **Logo:** Generated open-page line-art mark with a live Passage wordmark. File: `web/public/brand/passage-mark.png`.
- **Shape:** Small to medium corner radii, hairline dividers, and one clearly frosted prompt bar. Keep blur behind the input, with a readable fallback.
- **Imagery:** Original line art supports the hero and upload page. Actual report names, values, periods, pages, and AI evidence remain HTML data from the API. See `docs/design/iterations/r5-passage/asset-manifest.md`.
- **Motion:** Use short color, border, and hover transitions. No looping or pulsing indicators, shimmer, or scroll-linked motion. Respect reduced-motion settings.

## Layout and page behavior

### Home

- Use a light editorial navigation row with a visible PDF upload action.
- Lead with one direct statement and short product explanation.
- Show the sample document and its real source, period, detail, and page label beside the line-art illustration.
- Place a visible glass question bar in the hero. Connect it to the sample document endpoint and keep answers and citations visible.
- Keep a clear action for private PDF analysis.
- Describe product claims through the source, citations, and private upload behavior.
- Explain the source → question → evidence path, then show flexible report records.
- Finish with one focused PDF-analysis action.

### Report detail

- Show the source name, report title, period, and original-source link first.
- Separate source details, source passages, and AI answers into distinct surfaces.
- Keep report-page labels visible when supplied. Never present report metadata as a quoted page passage.
- Ask Gemini only after the user submits a question. Keep answer, citation, abstention, and error states readable and grounded.

### PDF upload

- Explain privacy and session expiry before file selection.
- Keep the native PDF input, drag/drop, PDF validation, 8 MB limit, extraction action, and restart behavior.
- Keep upload results, extracted details, source passages, and Q&A in the same source-first visual system.
- Show that uploaded PDFs are sent to Gemini, discarded by Passage, and not added to the example library.
- Accept documents with no numeric details when extraction includes page evidence.

### Responsive and accessible behavior

- Content max-width: 1280px, with page gutters that step from 32px to 24px to 18px as space narrows.
- Collapse the home hero, report details, and upload layout at their actual content-fit widths. Use normal document flow on phones; the hero artwork returns to its own row and the proof panel does not cover it.
- Long source names and numeric values wrap without horizontal scrolling.
- Use semantic headings, links, buttons, forms, labels, `aria-live` for returned answers and loading/errors, visible keyboard focus, and non-color-only status. The hidden file control remains keyboard-operable through its labeled drop area.

## Component donors and reuse

- Trajectory contributes airy editorial pacing, paper-like color fields, soft section transitions, and fine line art. The user-provided Wrk page contributes clear actions and real interface proof. Their code, copy, logo, colors, and artwork are not reused.
- `BudgetReportCard.vue` reuses the existing Vue record-card component and refines the earlier Career1 listing-pattern adaptation from [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career). No external component code is copied.
- `BudgetQuestion.vue` reuses the answer, citation, and follow-up hierarchy from the user-supplied streaming-answer example, with real API output only.
- The upload keeps the native file input and existing API state flow. No component or animation dependency is added.
- Component-source selection and reuse notes are in `docs/design/iterations/r5-passage/direction.md`.

## Rejected patterns

- Pulsing circles, online/status dots, shimmer loaders, generic AI sparkles, and decorative motion.
- Repeated rows of tiny labels or icon cards where a clear source/value hierarchy is stronger.
- Invented figures, customer logos, unsupported causal claims, or uploaded documents presented as official.
- Trajectory or Wrk branding, assets, text, source code, or exact composition.
- Decorative northeast arrows on actions; directional arrows remain only when they clarify navigation.
