# r5 Passage direction

## Product

Passage is a PDF question-and-answer reader. People ask a question, get a document-grounded answer, and inspect the page evidence. The example library currently contains a public budget report; it is one example, not the product category.

## Interface

- Headline first. No brand/category kicker above it.
- One upload action and one example link.
- A short glass prompt bar in the hero. Its placeholder asks what the visitor wants to know about the current document.
- A real source detail card sits beside original line art.
- The upload flow accepts structured details with or without numeric metrics, but needs page evidence for grounded answers.

## Visual system

- Warm ivory, navy, indigo, coral, and periwinkle. No green.
- Georgia display headlines with the existing system sans for UI and body text.
- Hairline borders, soft paper panels, one frosted input surface, and small hover/focus movements.
- No pulsing indicators, status dots, shimmer, or decorative AI sparkles.

## Boundaries

- Keep the Nuxt app, Express routes, sample report data, file limit, and temporary upload expiry.
- Do not call Gemini until a visitor submits a question or an upload.
- Keep the original source evidence separate from generated answers.
- Keep private PDFs out of the public example library.
