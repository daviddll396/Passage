# r4: Editorial report questions

## Direction

Replace the forest capsule and generated paper-card composition from r3. Use the user's Trajectory page and Wrk screenshot as design references, not templates.

The home screen opens on a clear editorial headline, one live report proof card, and a question composer attached to that report. A visible upload action takes visitors to private PDF analysis. Report library, detail, and upload use the same warm paper, ink, thin-rule, and line-art system.

Trajectory informs the open spacing and soft color fields. Wrk informs navigation and action clarity. BudgetLens keeps its own report subject, copy, colors, mark, API behavior, and composition.

## Interaction

- The hero composer asks the first public report from `/budget/reports`.
- It calls the existing report ask endpoint only after submit.
- It renders the existing answer, source citations, and error state.
- Its placeholder names the report in view.
- The upload CTA opens `/upload`.
- Focus, hover, and drag-over states use short transitions. No status dots, pulsing, or looping motion.

## Reuse

- Reuse `BudgetQuestion.vue` so home, report detail, and private PDF sessions share the same request and citation handling.
- Reuse `BudgetReportCard.vue` and the native PDF input.
- Use the built-in image generation tool for the original line-art illustration and project SVG for the mark. Add no new component or animation dependency.

## Verification targets

Check the live home report, hero submission and citations, upload flow, report detail, mobile order, keyboard focus, reduced-motion behavior, and glass fallback in the browser. Record captures after checks pass.
