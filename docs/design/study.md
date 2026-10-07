# Passage design study

**Current target:** `r9-passage-conversation-hero`. The user asked for direct implementation, so no mockup review is required.

## References and transferable patterns

| Reference | Observed pattern | Use in Passage |
|---|---|---|
| [Trajectory](https://www.trajectory.ai/) | Airy editorial opening, warm pale color fields, restrained grid lines, and fine illustrated artwork. Later sections shift in scale and tone. | Keep the page spacious. Use paper colors, line art, and deliberate changes between sections. Do not copy the product's artwork or branding. |
| User-supplied Wrk screenshot | Clear navigation, visible calls to action, and a large product interface shown as proof. | Make upload and example browsing easy to find. Show live source details rather than customer logos or invented metrics. |
| User-supplied Trajectory screenshot | Pastel sky tones, drawn forms, and a large typographic hero. | Use warm paper, navy, and coral in the interface. Avoid green interface surfaces, lavender panels, and broad pastel gradients. |
| User-supplied observatory landscape | Deep blue open sky, a distant observatory, coral grass, and a small fox. | Use the supplied image as a full-viewport hero background. Keep the headline and question bar centered over the sky. |
| [Prompt Kit](https://github.com/ibelick/prompt-kit) | Compact composer with textarea, action controls, and a loading state. The library targets React and Next.js. | Adapt its composer pattern in Vue with native controls. Keep the API and citation behavior already used by Passage. |

## Target behavior

- The home hero shows the first real example returned by `/budget/reports`.
- The question input submits to `/budget/reports/:id/ask` for the sample or `/budget/uploads/:uploadId/ask` for an uploaded document.
- The prompt placeholder names the active document. No AI request runs until the visitor submits.
- Uploading from the hero opens a modal, extracts the PDF, and attaches its filename and temporary upload ID to the prompt.
- The visitor question appears above the composer. After the JSON answer arrives, the UI reveals it progressively and then shows its citations.
- “Try an example” links to the sample library; “View on GitHub” opens the repository.
- The curated library keeps its public budget example. Visitors can upload other PDFs for private analysis.
- Upload extraction supports documents with or without structured numeric details, when page evidence is available.
- Report detail, report cards, upload privacy, expiry, and cited answers keep their existing data paths.
- The illustration is decorative. Values and evidence stay in the live HTML response.

## Visual decisions

- Warm paper canvas; deep navy ink; coral accent; muted slate. No green or lavender.
- Newsreader for display headings and DM Sans for body text and controls.
- Fine rule borders, transparent line art, and a compact frosted prompt bar. Keep the active document title beside the prompt.
- Short hover, focus, and border transitions. No pulsing dots or shimmer. Use the requested progress line and typing caret, with reduced-motion support.
- Remove the category kicker above the home headline. Keep the hero copy brief and place the prompt directly after it on small screens.
- Use a paper answer surface with a coral edge. A deliberate abstention has no unsupported-answer warning.
- Use a centered hero headline with the question bar below it. Keep the hero free of the previous floating sample-data card.
- Keep the hero at 100svh and edge to edge; overlay the navigation and upload action on the image.
- On the first question, hide the hero actions and anchor the composer near the bottom. The conversation area grows above it.
- Use the Prompt Kit pattern as a reference. Its React component is not installed in the Nuxt/Vue app.

## Verification

The r7 home page was inspected in the T3 preview at desktop size. The r8 and r9 changes still need visual checks at desktop and mobile sizes. Preview automation is unavailable: status reported no attached automation tab and repeated open attempts timed out. No live Gemini request was made. Reduced-motion and glass fallback rules are present in CSS.
## Q&A behavior note

The sample document is a public federal budget report. It contains budget details and October 2025 metadata, but no personal name. The correct result for “what is my name” is an abstention. The API sends extracted summary, details, and evidence excerpts to Gemini; it does not keep or search the full uploaded PDF after extraction. A fact that extraction leaves out may not be available to Q&A.
