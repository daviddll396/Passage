# Passage interface contract

## Product and audience

- **Purpose:** Help people understand PDFs, ask questions, and check answers against source passages.
- **Audience:** People who need clear answers from long documents.
- **Primary actions:** Try a published example or upload a PDF for private analysis.
- **Current design revision:** `r9-passage-conversation-hero`.
- **Design gate:** `docs/design/design-gate.json`.
- **Source study:** `docs/design/study.md`.
- **Review scope:** The user waived mockup-first review and authorized direct implementation for this scope. The waiver is recorded against the current revision in the gate.
- **Stack:** Existing Nuxt 3 and Vue app with the existing Express API. Do not migrate the stack.

## Fixed invariants

- Keep source data visually separate from AI answers.
- Ground AI answers in page evidence and abstain when the document is silent.
- Treat zero-citation answers as abstentions from the evidence available to Passage. Do not label a deliberate abstention as an unverified answer.
- Q&A uses extracted summaries, details, and excerpts rather than the full PDF. Describe missing answers as gaps in available evidence, not proof the full document omits them.
- Label document-page citations and source-listing metadata accurately.
- Keep user-uploaded PDF files private and temporary. The API sends PDF bytes to Gemini for extraction, then discards the file; extracted data and its questions expire after 30 minutes.
- Preserve the existing API paths, request payloads, upload limits, and sample library behavior.

## Brand anchor

- **Vibe:** Airy document editorial with a clear product interface. Use confident geometric headings, thin rules, warm paper surfaces, and real source data.
- **Palette:** Warm paper `#faf7f2`, navy ink `#20283d`, coral `#ef8b70`, and muted slate. Do not use green, lavender answer fills, or broad pastel gradients.
- **Type:** Newsreader for headings and DM Sans for controls and body copy.
- **Logo:** Generated open-page line-art mark with a live Passage wordmark. File: `web/public/brand/passage-mark.png`.
- **Shape:** Small to medium corner radii, hairline dividers, and a frosted prompt bar that grows into a compact cited conversation. Keep blur behind the input, with a readable fallback and restrained shadow.
- **Imagery:** The supplied observatory landscape fills the home hero. Original document line art supports the upload page. Actual report names, values, periods, pages, and AI evidence remain HTML data from the API. The hero image is `web/public/images/passage-observatory-hero.png`.
- **Motion:** Use short color, border, and hover transitions. No pulsing status dots, shimmer, or scroll-linked motion. The requested response uses a restrained progress line and typing caret; disable both for reduced motion.

## Layout and page behavior

### Home

- Overlay the navigation and visible PDF upload action on the hero.
- Use the observatory landscape as a full-viewport background, filling the first screen edge to edge.
- Center the headline and two calls to action, then place the glass question bar below them over the open sky.
- “Try an example” links to the sample library. “View on GitHub” opens the project repository.
- Connect the prompt to the sample document endpoint by default. Let visitors upload their own PDF in a dialog; show its filename in the composer after extraction.
- On submit, show a loading state, then add the question and progressively revealed answer above the composer. Show supporting citations after the answer finishes.
- Keep the upload action in the navigation and example library. Do not place a second sample-data card in the hero.
- Keep a clear action for private PDF analysis.
- Describe product claims through the source, citations, and private upload behavior.
- Explain the source → question → evidence path, then show flexible report records.
- Finish with one focused PDF-analysis action.

### Report detail

- Show the source name, report title, period, and original-source link first.
- Separate source details, source passages, and AI answers into distinct surfaces.
- Keep report-page labels visible when supplied. Never present report metadata as a quoted page passage.
- Ask Gemini only after the user submits a question. Keep answer, citation, abstention, and error states readable and grounded; show no warning under a deliberate abstention.

### PDF upload

- Explain privacy and session expiry before file selection.
- Keep the native PDF input, drag/drop, PDF validation, 8 MB limit, extraction action, and restart behavior.
- Keep upload results, extracted details, source passages, and Q&A in the same source-first visual system.
- Show that uploaded PDFs are sent to Gemini, discarded by Passage, and not added to the example library.
- Accept documents with no numeric details when extraction includes page evidence.

### Responsive and accessible behavior

- Content max-width: 1280px, with page gutters that step from 32px to 24px to 18px as space narrows.
- Keep the home hero at full viewport height on phones, with the landscape as a background behind the centered headline, actions, and prompt. In conversation mode, anchor the prompt near the bottom and let the answer area grow above it. Use normal document flow below the hero.
- Long source names and numeric values wrap without horizontal scrolling.
- Use semantic headings, links, buttons, forms, labels, `aria-live` for returned answers and loading/errors, visible keyboard focus, and non-color-only status. The hidden file control remains keyboard-operable through its labeled drop area.

## Component donors and reuse

- Trajectory contributes airy editorial pacing, paper-like color fields, soft section transitions, and fine line art. The user-provided Wrk page contributes clear actions and real interface proof. Their code, copy, logo, colors, and artwork are not reused.
- `BudgetReportCard.vue` reuses the existing Vue record-card component and refines the earlier Career1 listing-pattern adaptation from [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career). No external component code is copied.
- `BudgetQuestion.vue` reuses the answer, citation, and follow-up hierarchy from the user-supplied streaming-answer example, with real API output only.
- `PassageAssistant.vue` adapts the prompt-input pattern from [Prompt Kit](https://github.com/ibelick/prompt-kit) to the existing Nuxt/Vue app. Prompt Kit targets React and Next.js, so the UI uses native Vue controls and the existing API rather than installing its React component.
- The current Q&A API returns a structured JSON answer. The home UI reveals that answer progressively after the response arrives; network-level token streaming is not enabled.
- The upload keeps the native file input and existing API state flow. No component or animation dependency is added.
- Component-source selection and reuse notes are in `docs/design/iterations/r5-passage/direction.md`.

## Rejected patterns

- Pulsing circles, online/status dots, shimmer loaders, generic AI sparkles, and decorative motion.
- Repeated rows of tiny labels or icon cards where a clear source/value hierarchy is stronger.
- Oversized prompt and answer surfaces, broad pastel fields, diffuse shadows, and lavender answer fills.
- Invented figures, customer logos, unsupported causal claims, or uploaded documents presented as official.
- Trajectory or Wrk branding, assets, text, source code, or exact composition.
- Decorative northeast arrows on actions; directional arrows remain only when they clarify navigation.
