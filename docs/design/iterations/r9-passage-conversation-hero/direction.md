# Passage r9: Prompt-led document conversation

## Direction

Keep the observatory image as a full-viewport home background. Center the headline and two actions above a glass prompt: “Try an example” and “View on GitHub”. The prompt starts in the middle of the page.

The prompt can open a PDF upload dialog. After extraction, show the uploaded filename as an attachment. Sending a question displays a loading state, then adds the question and progressively revealed answer above the prompt. The composer stays near the bottom while the conversation grows upward. Keep supporting citations visible after the answer finishes.

## Component reference

Use Prompt Kit's composer as a design reference. It targets React and Next.js; Passage remains Nuxt and Vue and uses its current API.

## Verification

Run the production build and check the home hero, PDF dialog, attached-file state, loading state, progressive answer, citations, and responsive layout. The progressive answer is a client-side reveal after the API returns structured JSON, not network-level token streaming.
