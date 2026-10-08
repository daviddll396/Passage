# Passage design study

**Current direction:** `r11-passage-monochrome-waves`. The user asked for direct implementation, so this iteration does not require a mockup review.

## References

| Reference | Pattern used | Use and limits |
|---|---|---|
| [React Bits Pattern Waves](https://reactbits.dev/backgrounds/pattern-waves) and the user's settings screenshot | A repeated plus glyph bends into soft silk-like waves. The screenshot selects Plus marks and a Silk wave on black with white marks. | Build a restrained canvas effect in Vue. Do not import the React component. Do not capture the pointer. Pause it for hidden tabs and reduced motion. |
| [PantryPal](https://github.com/Velto-Studio/pantry-bud) | A product landing page moves from navigation and hero into problem/benefit, workflow, feature and product preview, FAQ, final action, and footer. | Adapt the section hierarchy for Passage. Leave out its mascot, pricing, copy, artwork, and code. |
| [Prompt Kit](https://www.prompt-kit.com/docs/prompt-input) | Compact prompt composer with document context and action controls. | Keep the existing Vue `PassageAssistant` behavior and restyle its composer. Do not add a React dependency. |

## Page structure

1. Glass navigation over a full-screen black wave hero.
2. Centered headline, example and GitHub links, and the existing document composer.
3. Monochrome bento with an illustrative stack of source sheets and two product facts.
4. Three short steps: open a document, ask, check the passage.
5. The separate live sample-document library with its existing states.
6. Short FAQ for evidence, supported PDFs, and temporary uploads.
7. Final upload action and shared footer.

There is no pricing section or mascot. The page has no fabricated statistics, testimonials, customer logos, or claims about live response streaming.

## Vue implementation

- `PatternWaves.vue` draws small white plus marks on a canvas. Vue lifecycle hooks manage resize, animation, reduced-motion preference, hidden-tab state, and cleanup.
- Inline SVGs and CSS draw the process icons, evidence stack, and closing illustration.
- The sample library stays separate from illustrative bento artwork and continues to load from the API.
- The prompt, upload dialog, chat, citations, and request paths stay in `PassageAssistant.vue` unchanged.

## Product limits shown in the UI

- Answers use extracted document information and show supporting passages when available.
- A lack of supporting evidence is not presented as proof that the full PDF does not contain the answer.
- Uploaded PDFs are private, the server discards the original after processing, and the session expires after 30 minutes.
- The API returns a JSON answer. The interface reveals that answer progressively; it does not stream tokens from Gemini.

## Verification

The T3 preview was checked at desktop and phone widths. The phone layout had no horizontal overflow, and the PDF dialog opened correctly. The report library showed its unavailable state because the API on port 4000 was not running. `npm run build` completed successfully. No tests were added or run.
