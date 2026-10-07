# BudgetLens design study

**Current target:** `r4-trajectory-lineart-prompt`. The user asked for a direct build, so no mockup review is required.

## References and transferable patterns

| Reference | Observed pattern | Use in BudgetLens |
|---|---|---|
| [Trajectory](https://www.trajectory.ai/) | Airy editorial opening, warm pale color fields, restrained grid lines, and fine illustrated artwork. Later sections shift in scale and tone. | Keep the page spacious. Use paper colors, line-art evidence, and deliberate changes between sections. Do not copy the product's artwork or branding. |
| User-supplied Wrk screenshot | Clear navigation, visible calls to action, and a large product interface shown as proof. | Make upload and report browsing easy to find. Show live report details rather than customer logos or invented metrics. |
| User-supplied Trajectory screenshot | Pastel sky tones, drawn forms, and a large typographic hero. | Use a restrained peach and periwinkle wash with BudgetLens ink and forest. Keep the question composer readable and functional. |

## Target behavior

- The home hero shows the first real public report returned by `/budget/reports`.
- Its question box submits to `/budget/reports/:id/ask` and reuses the existing answer and citation UI.
- The prompt placeholder names the featured report. No AI request runs until the visitor submits.
- A clear upload action leads to `/upload` for private PDF analysis.
- Report detail, report cards, upload, validation, privacy, expiry, and cited answers keep their current API behavior.
- The illustration is decorative. Values and evidence stay in the live HTML response.

## Visual decisions

- Warm paper canvas; deep ink and forest text; small sage, peach, and periwinkle accents.
- Georgia for large editorial headings and the existing system sans for body and controls.
- Fine rule borders, a transparent hero illustration, and one glass surface around the question composer.
- Short hover, focus, and border transitions only. No pulsing dots, shimmer, or looping decoration.
- On small screens, place the prompt directly after the heading and actions. Keep the artwork below it.

## Verification

The home, upload, and report-detail pages were inspected at 1402 × 876. The home prompt, upload action, live source data, and line-art asset render. At a narrow mobile width, the question box and upload action remain available and the page has no horizontal overflow. The Q&A form was not submitted, so this visual check did not call Gemini. Reduced-motion and glass fallback rules are present in CSS.
