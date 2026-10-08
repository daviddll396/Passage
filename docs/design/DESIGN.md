# Passage interface contract

## Product and audience

- **Purpose:** Help people read PDFs, ask questions, and check answers against source passages.
- **Audience:** People who need clear answers from long documents.
- **Primary actions:** Try a public example or upload a PDF for private analysis.
- **Current design revision:** `r12-passage-editorial-polish`.
- **Design gate:** `docs/design/design-gate.json`.
- **Source study:** `docs/design/study.md`.
- **Review:** The user asked for direct implementation without a mockup review. The gate records this waiver.
- **Stack:** Existing Nuxt 3 and Vue app with the Express API. Do not migrate the stack.

## Fixed product rules

- Keep source data separate from AI answers.
- Ground answers in extracted evidence. Abstain when that evidence does not support an answer.
- Treat zero-citation responses as abstentions from available evidence. Do not call them unverified answers.
- Passage uses extracted summaries, details, and excerpts for questions. A missing answer can mean extraction missed the needed text.
- Label page citations and report-listing metadata accurately.
- Keep uploaded PDFs private and temporary. The API sends PDF bytes to Gemini for extraction, then discards the original. The upload session expires after 30 minutes.
- Preserve API paths, request bodies, the 8 MB upload limit, and sample-library behavior.

## Visual direction

- **Home page:** Use the observatory image as a full-screen hero. Add a subtle navy overlay, a glass nav, and a clear prompt surface.
- **Home colors:** Use warm paper, navy, and salmon. Keep headings dark on light sections. Keep text cream on the navy evidence card.
- **Home type:** Use Newsreader for display headings and DM Sans for UI and body text. Interior pages keep their current type styles.
- **Home sections:** Keep the evidence bento, short process, sample library, FAQ, final upload action, and footer in this order.
- **Bento artwork:** Use inline SVG icons and the existing CSS document stack. Keep this artwork separate from the live sample library.
- **Closing action:** Use the existing boat landscape. Place the text on the left over a navy gradient.
- **Navigation:** Keep the nav fixed while the visitor scrolls. Use a dark navy glass surface so white controls stay readable over the hero and paper sections.
- **Interior pages:** Keep the existing light document layout and existing report/upload flows.
- **Motion:** Use Lenis for smooth wheel scrolling and anchor links. Keep touch scrolling native. Use a short hero intro and small hover changes. Do not add scroll-linked effects, pulsing dots, or shimmer.
- **Reduced motion:** Do not run the hero intro or smooth scrolling when the visitor asks for reduced motion. Keep native scrolling and page content available.

## Home behavior

- Keep the navigation over the hero and fixed at the top while scrolling.
- Center the headline, “Try an example” and GitHub actions, and the working prompt composer.
- Connect the prompt to the first live report returned by `/budget/reports`, when available.
- Keep the public sample library's loading, error, retry, empty, and report states.
- Let visitors open a native upload dialog, attach a PDF, and see the file name in the composer.
- On submit, show a loading state, then progressively reveal the returned answer and its citations. The API response is JSON; the network response is not token-streamed.
- Keep “Try an example” linked to the library and “View on GitHub” linked to the public repository.
- Use native `details` elements for FAQ disclosures.

## Reference use

- The observatory hero and boat closing landscape are existing approved Passage assets. Reuse them in their intended roles.
- The R11 monochrome wave treatment is historical. Do not render its Pattern Waves component on the home page.
- Keep Passage's own product behavior, copy, marks, and source data. Do not invent customer quotes, logos, metrics, or prices.

## Responsive and accessible behavior

- Keep the hero at least one viewport high on desktop and mobile. Use normal page flow below it.
- Keep every section inside the viewport width. Avoid horizontal scrolling.
- Use semantic headings, labels, buttons, links, keyboard focus, and live status for upload and answer states.
- Keep answer and dialog scrolling native. Respect `prefers-reduced-motion`.
- Let long source names, citations, and figures wrap.

## Related behavior

- Report detail keeps the source name, title, period, original-source link, source passages, and answer separate.
- The upload page keeps its file validation, drag and drop, extraction, privacy, and restart behavior.
- Full-stack implementation details and prompt-evaluation notes remain in the root README, not in home-page marketing copy.
