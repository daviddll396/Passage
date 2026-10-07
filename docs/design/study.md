# Passage design study

**Current target:** `r6-passage-source-context`. The user asked for direct implementation, so no mockup review is required.

## References and transferable patterns

| Reference | Observed pattern | Use in Passage |
|---|---|---|
| [Trajectory](https://www.trajectory.ai/) | Airy editorial opening, warm pale color fields, restrained grid lines, and fine illustrated artwork. Later sections shift in scale and tone. | Keep the page spacious. Use paper colors, line art, and deliberate changes between sections. Do not copy the product's artwork or branding. |
| User-supplied Wrk screenshot | Clear navigation, visible calls to action, and a large product interface shown as proof. | Make upload and example browsing easy to find. Show live source details rather than customer logos or invented metrics. |
| User-supplied Trajectory screenshot | Pastel sky tones, drawn forms, and a large typographic hero. | Keep warm paper and navy. Use coral as a small accent. Avoid green, lavender panels, and broad pastel gradients. |

## Target behavior

- The home hero shows the first real example returned by `/budget/reports`.
- Its question input submits to `/budget/reports/:id/ask` and reuses the existing answer and citation UI.
- The prompt placeholder names the example document. No AI request runs until the visitor submits.
- A clear upload action leads to `/upload` for private PDF analysis.
- The curated library keeps its public budget example. Visitors can upload other PDFs for private analysis.
- Upload extraction supports documents with or without structured numeric details, when page evidence is available.
- Report detail, report cards, upload privacy, expiry, and cited answers keep their existing data paths.
- The illustration is decorative. Values and evidence stay in the live HTML response.

## Visual decisions

- Warm paper canvas; deep navy ink; coral accent; muted slate. No green or lavender.
- Space Grotesk for display headings and DM Sans for body text and controls.
- Fine rule borders, transparent line art, and a compact frosted prompt bar. Keep the active document title beside the prompt.
- Short hover, focus, and border transitions only. No pulsing dots, shimmer, or looping decoration.
- Remove the category kicker above the home headline. Keep the hero copy brief and place the prompt directly after it on small screens.
- Use a paper answer surface with a coral edge. A deliberate abstention has no unsupported-answer warning.

## Verification

The home page was inspected in the T3 preview at 1402 × 876. The prompt, source label, upload action, sample data, and line-art asset render. No live Gemini request was made during this check. The mobile viewport resize timed out, so mobile behavior is not verified in this revision. Reduced-motion and glass fallback rules are present in CSS.

## Q&A behavior note

The sample document is a public federal budget report. It contains budget details and October 2025 metadata, but no personal name. The correct result for “what is my name” is an abstention. The API sends extracted summary, details, and evidence excerpts to Gemini; it does not keep or search the full uploaded PDF after extraction. A fact that extraction leaves out may not be available to Q&A.
