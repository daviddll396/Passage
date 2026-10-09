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

- **Home page:** Frame the observatory image as a rounded landscape hero with an 8 px desktop gutter and 6 px small-screen gutter, replacing the previous full-bleed treatment. Keep the subtle navy overlay, full-width silver navigation, and clear prompt surface.
- **Home colors:** Use a silver page background with navy and salmon accents. Keep headings dark on light sections. Use pure-white, borderless feature cards with pale embossed icons.
- **Home type:** Use regular DM Sans for the centered hero headline and supporting copy, with the existing Passage mark in a glass tile inline on its first line. Keep Newsreader for lower-section display headings and DM Sans for UI, process headings, and body text. Interior pages keep their current type styles.
- **Home sections:** Place a subdued technology strip immediately after the hero and before the feature cards. Label it “Built with tools we trust.” and show Nuxt, TypeScript, Express, MySQL, Gemini, and GCP as monochrome wordmarks. Follow it with four feature cards, a centered process heading and wide white walkthrough panel, sample library, FAQ, final upload action, and footer in this order. Show all four cards in one row on desktop, two columns at tablet widths, and one column below 640 px. Stack the walkthrough panel below 900 px.
- **Feature cards:** Use a wider evidence card with a pale document-and-check SVG icon, then cards for questions, privacy, and PDF upload. Keep all cards pure white and borderless, with large faint 01–04 indices and matching pale inline SVG icons. Keep this artwork separate from the live sample library.
- **Process panel:** Center the “From your question to the source.” heading above one rounded white panel. Put the title, copy, checked steps, and example CTA on the left; show an illustrative document and answer preview with a source-page badge on the right. Keep the inset preview silver and label it as illustrative.
- **Closing action:** Frame the existing boat landscape in a wide rounded panel. Center the eyebrow, DM Sans heading, supporting copy, and two contrasting glass actions over a dark navy overlay.
- **Navigation:** Keep the header above the home hero at page top and sticky at the viewport top while visitors scroll. Keep its full width, spacing, and shape. Use a solid silver background. Do not change or animate its style during scroll. Use the shared sticky header on interior pages.
- **Glass surfaces:** Use a light glass surface for home navigation and translucent navy glass for the prompt, conversation, and secondary GitHub action. Align visitor questions to the right, show Passage answers on the left, and place source labels and page details in readable glass cards. Layer a soft specular wash and inset edge highlights over the fill, keep blur and saturation moderate, and preserve readable text and focus rings. Use a denser fill when backdrop filters are unavailable.
- **Upload dialog:** Use a legible silver glass panel with a subtle rim, coral document tile, rounded silver dropzone, separated lock note, soft coral error, and coral primary action. Keep native dialog motion brief and turn it off for reduced motion.
- **Interior pages:** Keep the existing light report layout and shared sticky navigation. The home page owns the PDF upload flow.
- **Motion:** Use Lenis for smooth wheel scrolling and anchor links. Keep touch scrolling native. Use a short hero intro and small hover changes. Reveal conversation turns and citations with a short fade and slide. On fine pointers, show a subtle prompt light. Animate native FAQ disclosures on open and close. Keep the reading-room skeleton shimmer subdued and under 1.4 seconds. Show a small, non-blocking Passage loading pill only until mount. Do not add scroll-linked movement or pulsing dots.
- **Reduced motion:** Do not run the hero intro or smooth scrolling when the visitor asks for reduced motion. Disable the prompt light, FAQ transitions, skeleton shimmer, and spinner rotation. Keep native scrolling and page content available.

## Home behavior

- Keep the navigation above the hero at page top and sticky at the viewport top while visitors scroll. Keep its full width, spacing, and shape unchanged.
- Center the headline, “Try an example” and GitHub actions, and the working prompt composer.
- Connect the prompt to the first live report returned by `/budget/reports`, when available.
- Keep the public sample library's loading, error, retry, empty, and report states.
- Route every home upload action and legacy `/upload` link to the hero composer. Let visitors attach a PDF, see its name, and return focus to the hero question input after a successful upload.
- Keep a second, independent composer in the reading room. It follows the selected public report or an uploaded private PDF.
- On submit, show a loading state, then progressively reveal the returned answer and its citations. The API response is JSON; the network response is not token-streamed.
- Keep “Try an example” linked to the library and “View on GitHub” linked to the public repository.
- Keep the composer submit control as a circular arrow button, 44 px on desktop and 40 px on phones. Give it an accessible name that changes while the question is sending.
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
- The upload dialog keeps file validation, drag and drop, extraction, privacy, and private-session behavior.
- Full-stack implementation details and prompt-evaluation notes remain in the root README, not in home-page marketing copy.

## Reading room

- Use a compact “The reading room” eyebrow, a DM Sans heading, and a direct PDF upload action. Keep report cards and states white on the silver page, with the live loading, error/retry, empty, and report states visible.
- Let visitors select a report card for the reading-room composer. Keep the composer available while reports load or fail, and let visitors upload a PDF when no sample is available.

## FAQ and footer

- Keep the FAQ factual and use native `details` disclosures. Keep the 8 MB upload limit and 30 minute private session accurate.
- Use a full-width white footer surface with content aligned to 32 px desktop and 18 px phone gutters. Keep working examples, upload, and GitHub links. Show existing Nuxt, TypeScript, Express, MySQL, Gemini, and GCP marks beside grouped text labels, not as links. Fade the coral Passage wordmark into the white bottom.
