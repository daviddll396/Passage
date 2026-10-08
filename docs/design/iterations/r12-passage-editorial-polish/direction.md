# Passage r12: Editorial home polish

## Parent and status

- Parent: `r11-passage-monochrome-waves`.
- Status: Accepted for implementation. The user asked to restore the earlier navy, salmon, and landscape direction while keeping the current page structure.

## Reason

The monochrome treatment replaced an approved Passage direction. The page also needs a clearer glass prompt, a fixed nav that stays readable over light sections, and restrained motion.

## Presented and accepted

- Use the existing observatory image behind the full-screen hero.
- Use Newsreader for display headings and DM Sans for body text and controls.
- Use warm paper, navy, and salmon. Keep the evidence card navy with cream text. Keep the question and privacy cards warm.
- Use the existing boat landscape for the closing upload action. Keep its text on the left over a navy gradient.
- Keep the evidence bento, process, live sample library, FAQ, closing action, and footer in the current order.
- Keep the fixed nav as dark navy glass. Keep the hero prompt as low-opacity navy glass with white text and salmon controls.
- Use Lenis for wheel scrolling and anchors. Keep touch and nested scrolling native. Stop Lenis and the hero intro when reduced motion is requested.
- Keep icons inline and small. Remove repeated overlines and process ordinals.

## Rejected

- The monochrome hero and wave canvas.
- White frosted composer glass, small decorative labels, boxed process steps, and the old document doodle in the closing card.
- Parallax, scroll-linked reveals, shimmer, and other continuous effects.

## Unresolved

- Desktop home and section states were reviewed. Phone review at 320 px and 390 px remains open because the preview resize did not complete.
- The local sample library still depends on the API service being available.

## Root review evidence — 8 October 2026

- The local page at port 3100 renders the observatory hero, navy and salmon styles, clear glass composer, fixed navigation, and boat closing section.
- The upload dialog opens from the navigation and closes with Escape.
- Lenis is active. The chat and upload dialog have native scroll exceptions.
- The home, assistant, and shell script hashes match the pre-edit hashes. The app script adds only the requested Lenis setup.
- Desktop has no horizontal overflow. Browser frames at 390 by 844 and 320 by 640 have no horizontal overflow; the hero and prompt fit inside each frame.
- The preview resize command timed out. Full phone interaction review remains open.
- The local API does not load the sample library. This pass checks its error view and does not change the API.
- `git diff --check` passed. No tests, production build, commit, or push were run.
