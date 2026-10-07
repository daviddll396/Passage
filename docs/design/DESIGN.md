# BudgetLens interface contract

## Product and audience

- **Purpose:** Help people read public budget reports, inspect reported figures, and ask questions grounded in the source text.
- **Audience:** People who need to understand budget documents without reading every page.
- **Primary actions:** Open a public report or upload a PDF for private analysis.
- **Current design revision:** `r4-trajectory-lineart-prompt`.
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

- **Vibe:** Airy public-finance editorial with a clear product interface. Use serif display headlines, thin rules, warm paper surfaces, and real report data.
- **Palette:** Page paper `#f8f7ef`, ink `#203241`, forest `#203b39`, muted gray `#697782`, pale sage `#edf2dc`, peach and periwinkle accents, and lime `#d6ed9e` for limited emphasis.
- **Type:** System sans for controls and body copy; Georgia for large editorial headings. Do not load a new font service.
- **Logo:** Project-authored SVG document and magnifier mark with a live BudgetLens wordmark. File: `web/public/brand/budgetlens-mark.svg`.
- **Shape:** Small to medium corner radii, hairline dividers, and a translucent hero question panel. Use blur only where text contrast remains strong.
- **Imagery:** One original transparent line-art report illustration supports the hero and upload page. Actual report names, values, periods, pages, and AI evidence remain HTML data from the API. See `docs/design/iterations/r4-trajectory-lineart-prompt/asset-manifest.md`.
- **Motion:** Use short color, border, and hover transitions. No looping or pulsing indicators, shimmer, or scroll-linked motion. Respect reduced-motion settings.

## Layout and page behavior

### Home

- Use a light editorial navigation row with a visible PDF upload action.
- Lead with one direct statement and short product explanation.
- Show the featured report and its real source, period, metric, and page label beside the line-art illustration.
- Place a glass question composer in the hero. Connect it to the featured report ask endpoint and keep answers and citations visible.
- Keep a clear action for private PDF analysis.
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

- Trajectory contributes airy editorial pacing, paper-like color fields, soft section transitions, and fine line art. The user-provided Wrk page contributes clear actions and real interface proof. Their code, copy, logo, colors, and artwork are not reused.
- `BudgetReportCard.vue` reuses the existing Vue record-card component and refines the earlier Career1 listing-pattern adaptation from [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career). No external component code is copied.
- `BudgetQuestion.vue` reuses the answer, citation, and follow-up hierarchy from the user-supplied streaming-answer example, with real API output only.
- The upload keeps the native file input and existing API state flow. No component or animation dependency is added.
- Component-source selection and reuse notes are in `docs/design/iterations/r4-trajectory-lineart-prompt/direction.md`.

## Rejected patterns

- Pulsing circles, online/status dots, shimmer loaders, generic AI sparkles, and decorative motion.
- Repeated rows of tiny labels or icon cards where a clear source/value hierarchy is stronger.
- Invented figures, customer logos, unsupported causal claims, or uploaded documents presented as official.
- Trajectory or Wrk branding, assets, text, source code, or exact composition.
- Decorative northeast arrows on actions; directional arrows remain only when they clarify navigation.
