# BudgetLens design study

**Mode:** Design study. The user asked us to use Restate as visual inspiration, not to reproduce its product.

## Restate

- Source: [restate.dev](https://restate.dev), reviewed on 6 October 2026.
- Evidence: One desktop view at 1280 × 800.
- Observed: A compact dark navigation bar, a large direct headline, a cyan and blue hero surface, and clear product panels below the headline.
- Transfer: Use a clear navigation bar, strong headline, focused calls to action, and structured panels that make product behavior easy to scan.
- Limits: This review did not measure Restate's phone behavior, exact font files, or internal components. The BudgetLens phone layout is designed for this product and is not presented as a reproduction.
- Avoid: Restate's product name, logo, text, images, code, and exact brand colors.

## User-provided Wise style reference

- Source: The style reference supplied in this conversation on 6 October 2026.
- Transfer: Use Forest Ink `#163300` for strong surfaces, Lime Voltage `#9fe870` as a single accent, Paper and Fog for clean reading surfaces, compact pills, and high-weight display text.
- Adaptation: Use a restrained forest-to-teal blend on the featured report panel to connect the palette to Restate's colorful hero treatment. Keep the report figures on flat, high-contrast surfaces.

## Component donors

- **Report cards:** Adapt the card and badge hierarchy already used by `web/components/RoleCard.vue`. That component records Career1, the free/basic career listing pattern from [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career), as its donor. Only the visible layout pattern is reused; no external code, logo, or image is copied.
- **Answer and evidence:** Adapt the answer, citation, and follow-up hierarchy from the streaming answer example the user pasted in the conversation. Replace its sample copy and source chips with report evidence returned by the API.
- **Upload control:** Use the native PDF file input, with a visible drop target and clear progress, error, and file-size states. No upload library is needed.

## Product claims

- An official report is linked to its Open Treasury source.
- The public library displays only verified values stored for that report.
- The model must use report evidence and must abstain when the evidence does not answer the question.
- Uploaded PDF bytes go to Gemini for extraction and are then discarded by the API. Extracted upload data expires after 30 minutes in the local demo.
