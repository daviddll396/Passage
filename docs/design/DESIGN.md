# BudgetLens interface contract

## Product and audience

- Purpose: Help people read public budget reports and ask questions about the source text.
- Primary action: Upload a PDF or open a report from the public library.
- Audience: People who need to understand budget documents without reading every page.

## Design gate

- Gate index: `docs/design/design-gate.json`
- Source study: `docs/design/study.md`
- Current revision: `r2-budgetlens`
- Review state: The user waived mockups and the review pause, and asked for direct implementation.
- Target stack: Nuxt 3 and Vue. Keep the existing app and API.

## Reference mode

- Mode: Design study. Use Restate for layout and hierarchy. Do not copy its brand, text, code, or assets.
- Main source: `https://restate.dev`
- Evidence limits: The source review used one desktop screen. It does not prove mobile behavior or font files.
- Donors: The existing `RoleCard.vue` uses the Career1 card and badge pattern from shadcnblocks-vue. The report card adapts that project pattern. The user supplied a streaming answer example; the question panel adapts its answer, evidence, and follow-up hierarchy.

## Fixed design decisions

- Palette: Forest Ink `#163300`, Lime Voltage `#9fe870`, Paper `#ffffff`, Fog `#e8ebe6`, Charcoal `#454745`. Use a restrained green-to-teal surface on the featured report panel.
- Type: Use the system sans stack. Use heavy, tightly tracked type for page titles. Use 13–16px body copy and small labels only for metadata.
- Shape: Use pill buttons and tags, 10–16px information cards, and thin borders.
- Voice: Plain, factual, and clear about unknown values.
- Source data: Show verified report values as published. Show AI explanations separately and include evidence. Do not invent causes or conclusions.
- Uploads: Tell users that PDFs are sent to Gemini. Do not publish uploads. Discard PDF bytes after extraction. Keep extracted data only for the stated temporary session.
- Assets: Use no copied Restate assets or external product logos. The BudgetLens mark is a small inline SVG chart icon.

## Layout and behavior

- Page width: 1240px maximum with 28px desktop gutters and 17px phone gutters.
- Home order: Navigation, headline and featured source, three-step explanation, report library, upload call to action.
- Report page: Source and period, published metrics, evidence passages, then grounded questions.
- Upload page: File selection, extraction result, evidence, grounded questions, privacy note.
- Breakpoints: Stack the home hero at 680px, report layout at 800px, and upload layout at 780px. Keep controls full-width where needed on phones.
- Motion: Use only short hover, focus, and loading feedback. Respect reduced motion. No scroll-linked animation.
- Accessibility: Use semantic headings, buttons, links, labels, visible focus, and keyboard-operable file input. Never use colour alone to convey a state.

## Interaction rules

- Report questions call Gemini only after the user submits a question.
- Upload processing starts only after the user selects a PDF and presses the analysis button.
- Return citations only when the backend validates them against report evidence.
- If there is no supporting evidence, show that the report does not provide enough information.
- Show the source link and page label beside report values where known.

## Rejected patterns

- Salary index or job-board content: This project is about report evidence, not job search.
- Invented sample figures or unsupported explanations: They would weaken trust in the source data.
- Uploads that become public by default: A visitor's document belongs to that visitor.
- Copying Restate's identity or page text: Restate is a layout reference only.
