---
description: Apply anti-slop UI and visual QA rules to the game's React and CSS surfaces.
applyTo: 'src/**/*.{tsx,ts,css}'
---

For UI work in this project:

- Keep hierarchy intentional and reduce repeated card/pill treatments.
- Use explicit labels for primary actions; icon-only buttons need `title` and `aria-label`.
- Keep semantic colors consistent: amber actions, emerald gains, rose danger, sky information.
- Prefer readable dense data over decorative effects, gradients, emoji, or gratuitous shadows.
- Validate the first viewport and one end-to-end game loop in a browser after visual changes.
