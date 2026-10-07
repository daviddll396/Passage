# BudgetLens direction r2

- Parent: `r1-openrole-identity`
- Status: Build under the user's review waiver.
- Rationale: Replace the job search direction with a source-first public budget report explorer and private PDF question flow.
- Source study: `docs/design/study.md`
- Accepted: Use Restate's page hierarchy and technical panels as inspiration. Keep the user-supplied forest and lime palette. Build directly without first presenting stills or mockups. Keep the existing Nuxt and Express project.
- Rejected: Copying Restate brand assets, copy, or exact appearance; fake report figures; making visitor uploads public.
- Unresolved: The official PDF is linked, but BudgetLens cannot independently verify a user's uploaded PDF against the issuer.
- Review waiver: The user said, “dont worry about giving me stills or a design first just go ahead and build.” The waiver covers the brand and page review for this revision.
- Layout: A centered max-width shell, a compact dark rounded navigation bar, an oversized headline, a featured source panel, report cards, an upload page, and a cited question panel.
- Responsive: Stack the hero and report details on narrow screens. Keep source values, upload status, and evidence readable without horizontal scrolling.
- Motion eligibility: Transition only. Use brief hover, focus, and loading feedback; respect reduced motion.
- Donors: Existing RoleCard/Career1 card and badge hierarchy; user-supplied streaming answer pattern; native PDF input. See `docs/design/study.md` for source links and reuse limits.
