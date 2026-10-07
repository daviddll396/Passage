# Passage r6: Source context and abstentions

## Why

The user questioned an answer to “what is my name” on the public October 2025 budget report. The report has no personal name, so refusing to answer is correct. The API replaced the model's abstention with generic text, and the page then labeled it unverified. This made a correct result look like an AI failure.

## Changes

- Return a clear abstention when Gemini gives no citation indexes.
- Include `abstained` in the Q&A response so the page does not show the unsupported-answer warning for an intentional refusal.
- Show the active document beside the prompt.
- Use paper, navy, coral, and slate on the composer, answer, and source states. Remove remaining lavender fills and pastel gradients.
- Explain that Q&A can use only the data extracted for the document. Uploaded PDF bytes are discarded after extraction.

## Verification

The T3 desktop preview showed the source label, prompt, sample report, and illustration. No live Gemini request was made. The mobile preview resize timed out.
