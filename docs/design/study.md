# Passage design study

**Current target:** `r5-passage`. The user asked for direct implementation, so no mockup review is required.

## References and transferable patterns

| Reference | Observed pattern | Use in BudgetLens |
|---|---|---|
| [Trajectory](https://www.trajectory.ai/) | Airy editorial opening, warm pale color fields, restrained grid lines, and fine illustrated artwork. Later sections shift in scale and tone. | Keep the page spacious. Use paper colors, line art, and deliberate changes between sections. Do not copy the product's artwork or branding. |
| User-supplied Wrk screenshot | Clear navigation, visible calls to action, and a large product interface shown as proof. | Make upload and example browsing easy to find. Show live source details rather than customer logos or invented metrics. |
| User-supplied Trajectory screenshot | Pastel sky tones, drawn forms, and a large typographic hero. | Use a peach, periwinkle, navy, and coral palette. Keep the question input readable and functional. |

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

- Warm paper canvas; deep navy ink; coral and periwinkle accents. No green.
- Georgia for large editorial headings and the existing system sans for body and controls.
- Fine rule borders, transparent line art, and a visibly frosted prompt bar.
- Short hover, focus, and border transitions only. No pulsing dots, shimmer, or looping decoration.
- Remove the category kicker above the home headline. Keep the hero copy brief and place the prompt directly after it on small screens.

## Verification

The home, upload, and report-detail pages were inspected at 1402 × 876. The home prompt, upload action, live source data, and line-art asset render. At a narrow mobile width, the question box and upload action remain available and the page has no horizontal overflow. The Q&A form was not submitted, so this visual check did not call Gemini. Reduced-motion and glass fallback rules are present in CSS.
