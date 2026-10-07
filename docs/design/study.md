# BudgetLens design study

**Mode:** Design study. Restate is visual inspiration. The target keeps BudgetLens's identity, source-first purpose, report data, and existing Vue behavior.

**Current target revision:** `r3-budgetlens-proof-panels`.

## Source inventory and evidence limits

| ID | Source | Evidence | Use |
|---|---|---|---|
| `restate-home-desktop-01` | [Restate homepage](https://restate.dev/) | `docs/design/evidence/source/restate-home-1402x876.png`; first view, 1280 × 800, default state, captured 6 October 2026. The announcement strip and cookie panel were visible. | Primary hierarchy and product-proof reference. |
| `composition-01` | `C:/Users/ASUS/.agents/skills/builda/assets/reference-library/brand-composition-01.png` | Full-resolution local still inspected. | Supporting editorial split and quiet-border relationship. |
| `composition-03` | `C:/Users/ASUS/.agents/skills/builda/assets/reference-library/brand-composition-03.png` | Full-resolution local still inspected. | Supporting repeated-panel hierarchy. |
| `wise-style-01` | User-provided Wise style reference in this conversation | Text token specification | Target palette, pill controls, display/body roles, flat surfaces, and restrained lime use. |
| `answer-layout-01` | User-provided streaming answer component in this conversation | Vue code sample | Answer, citation, and follow-up structure. Product content must remain live API output. |

The Restate capture does not establish its rendered font file, mobile layout, hidden implementation, accessibility, performance, or motion timing. The source capture shows page-position dots, but not whether they move; BudgetLens excludes them by design. The local compositions are visual guidance only. Their brands, wording, images, and marks are not target assets.

## Restate relationship records

### `study-01` — one statement before product detail

- **Observed source and evidence:** `restate-home-desktop-01`, 1280 × 800, first-view desktop capture. A large centered two-line heading sits below a compact dark navigation capsule and above a short explanation and two actions.
- **Effect:** The visitor can identify what the product does before reading the rest of the page.
- **Cause hypothesis:** A single high-scale headline, limited copy measure, and short action row reduce competing first-view elements.
- **Transferable relationship:** Keep one direct BudgetLens statement, one concise explanation, and two clear actions before secondary detail.
- **Break condition:** If a two-column target headline becomes too long or competes with the data artwork, shorten or reflow the copy; do not retain centered composition for its own sake.
- **Proposed target:** “Public budgets, in clear focus.” with “Find a figure. Ask the report. Follow every answer back to its source.”
- **Verified target:** Pending target browser captures at desktop and phone widths.

### `study-02` — product proof after the promise

- **Observed source and evidence:** `restate-home-desktop-01`. Customer marks sit under the actions, and a large illustrated field begins along the lower part of the visible page. More structured product panels appear in the page content below.
- **Effect:** The headline is followed by visual evidence that this is a working technical product.
- **Cause hypothesis:** A shift from open headline space to denser product proof gives the page a clear change in pace.
- **Transferable relationship:** Replace customer logos with real report data, source identity, period, metric, and a link to the report. Let a custom illustration support that information instead of carrying it.
- **Break condition:** Customer marks would imply partnerships or endorsements that BudgetLens cannot claim. Generated chart strokes must never be mistaken for report data.
- **Proposed target:** A report proof panel over a generated paper illustration. Every displayed figure, source, period, and page value comes from the API response.
- **Verified target:** Pending browser render and API-connected home view.

### `study-03` — quiet object scale

- **Observed source and evidence:** Local `composition-01` uses one large object beside a large statement inside a restrained edge system. Local `composition-03` uses repeated panels while preserving an identifiable hierarchy.
- **Effect:** One object feels substantial; supporting text and panels remain readable and related.
- **Cause hypothesis:** Unequal element scale and consistent alignment create hierarchy without extra decoration.
- **Transferable relationship:** Give the BudgetLens headline and paper illustration separate zones, then use the same source, period, figure, and action order in report cards.
- **Break condition:** On phones, the proof card must return to normal flow. If the art steals attention from the headline or real figure, reduce its size or remove its frame.
- **Proposed target:** Forest and lime mark and controls on warm paper, with original generated report art and clear HTML proof.
- **Verified target:** Pending target screenshots at desktop and phone widths.

## Target system proposal

- **Primary anchor:** A live report figure with source name and period.
- **Attention order:** Brand navigation → headline → explanation/actions → real report proof → source-to-question-to-evidence path → report library.
- **Image and copy zones:** Hero copy owns the left field; transparent paper art occupies the right panel; the real data card sits in a text-safe lower-left zone. Phone layout stacks copy, art, and card.
- **Type ratios:** Inter Black headline roughly 3.5–5 times body text; section heading about 2.5–3 times body; report values remain larger than source metadata. Family loaded from Google Fonts with a system fallback; verify the actual rendered face.
- **Rhythm:** Wide open hero → short three-part process → detailed source cards → focused upload callout. Use borders and paper/fog surfaces for transitions, not scroll effects.
- **Controls:** Forest/lime primary action, outline secondary action, native file picker, visible focus, and keyboard-operable report/question controls. No hover layout movement.
- **Motion:** Static page. Small color/border feedback only. No motion samples are claimed from Restate's screenshot.

## Component donors and reuse boundaries

- Restate supplies the visual pattern for headline, support copy, CTA hierarchy, dark capsule nav, and later product proof. No source code, marks, images, exact page layout, text, or palette is reused.
- `BudgetReportCard.vue` adapts the existing Career1 listing pattern already documented in the source project from [shadcnblocks-vue](https://shadcnblocks-vue.com/preview?category=career). The repo remains Nuxt/Vue; no React block or new dependency is added.
- `BudgetQuestion.vue` adapts the answer/evidence/follow-up hierarchy from the user-provided component. The example's mock sources, flavor content, streaming effect, and action icons are not used.
- PDF upload continues to use the existing native input and existing API state flow.
- The free-resource catalog was checked. A matching OnePrompt Design Free Use prompt was not found; the original asset prompts and results are in `docs/design/iterations/r3-budgetlens-proof-panels/asset-manifest.md`.

## Proposed assets and claim boundaries

- `web/public/brand/budgetlens-mark.svg`: project-authored vector mark; no external logo.
- `web/public/images/budgetlens-evidence-layers.png`: generated editorial paper and magnifier illustration. Chart strokes are non-data decoration.
- `web/public/images/budgetlens-report-folder.png`: generated folder and document illustration. It is not a real document or public agency artifact.
- Actual published figures, period, page, and source name stay in HTML and come from the API.
- Uploaded PDFs are described as private sessions and are not shown as published public reports.

## Verified target captures

- Desktop home (1402x876): `docs/design/evidence/target/home-desktop.png`. The headline stays on two lines, the hero shows the live report figure, and the proof strip begins in the first viewport. The footer wordmark contrast is recorded in `docs/design/evidence/target/home-footer-desktop.png`.
- Phone home (390x844 CSS viewport): the headline, two actions, artwork, and featured report stack in order. No horizontal overflow.
- Desktop report detail (1402x876): `docs/design/evidence/target/report-desktop.png`. Source metadata and link sit above the two-column figures and question panels.
- Phone report detail (390x844 CSS viewport): figures and question form stack in one column. The largest naira figure fits on one line, and the page has no horizontal overflow.
- Desktop upload (1402x876): `docs/design/evidence/target/upload-desktop.png`. The artwork, PDF workspace, and privacy panel remain distinct.
- Phone upload (390x844 CSS viewport): introduction and artwork stack before the PDF form; no horizontal overflow.
- The Inter font is loaded (`document.fonts.check('700 16px Inter')` returned true). The mark and generated images render in the browser. No pulse indicator appears on the redesigned routes.

Phone layouts were checked in a same-origin iframe after the preview resize control timed out. The app viewport inside the frame was 390x844 CSS pixels.
