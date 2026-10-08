# Passage r11: Monochrome waves and product-led home

## Reason

The user rejected the current page aesthetic and asked for a black-and-white redesign. They chose React Bits Pattern Waves for the hero, a glass navigation bar, a PantryPal-style landing-page structure, a bento section, and a stacked-card illustration. They asked to keep the existing hero composer and to leave pricing out.

## Direction

- Use a black, full-viewport hero with a subtle white plus-mark wave pattern.
- Draw the pattern in Vue. Do not import React components or add dependencies.
- Center the existing headline, example and GitHub actions, and working PDF composer.
- Use a glass nav and prompt surface with readable monochrome contrast.
- Follow a product landing-page structure: hero, bento proof, how it works, public samples, FAQ, final upload action, footer.
- Draw simple line icons and a stacked document/evidence illustration in CSS and inline SVG.
- Keep the bento illustration separate from the live public report library.
- Leave out pricing, mascot, fake testimonials, fabricated figures, and unsupported claims.
- Preserve report and upload page behavior and styling.

## Donor record

- React Bits Pattern Waves: pattern and motion reference. Adapted as a Vue canvas with no pointer input, reduced-motion support, and hidden-tab pause.
- PantryPal: page hierarchy reference only. No code, copy, image, mascot, or pricing reuse.
- Prompt Kit: prompt layout reference only. The current Vue assistant and request logic remain in place.

## Review

The user authorized direct implementation without a mockup review. The waiver is recorded in `docs/design/design-gate.json`. The T3 preview was checked at desktop and phone widths. The phone layout had no horizontal overflow, and the PDF dialog opened correctly. The report library showed its unavailable state because the API on port 4000 was not running. `npm run build` completed successfully. No tests were added or run.
