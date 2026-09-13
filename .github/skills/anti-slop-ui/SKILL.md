---
name: anti-slop-ui
description: Review and improve game interfaces so they feel intentional, readable, and product-designed rather than template-generated.
---

# Anti-Slop UI Review

Use this skill for front-end changes in the temki game, especially screens with dense market, inventory, auction, or negotiation data.

## Principles

- Establish one clear visual hierarchy: page title, section title, primary action, then supporting metadata.
- Prefer meaningful grouping over a grid of identical cards. Use spacing and typography before adding borders, shadows, or rounded containers.
- Keep primary actions explicit. Icon-only controls require a visible tooltip/title and must not carry essential meaning alone.
- Use a small semantic color vocabulary: amber for player actions and attention, emerald for gains/success, rose for danger/loss, sky for informational state.
- Avoid decorative gradients, gratuitous glow, excessive pills, and emoji as the main visual language.
- Keep dense data scannable: labels should be short, values aligned, and secondary copy visibly quieter.
- Do not hide important status behind hover-only interactions or collapsed sections without a visible affordance.
- Preserve the game's rough Russian resale-market personality through copy and details, not through random visual noise.

## Review loop

1. Open the app at desktop and narrow viewport widths.
2. Check the first viewport for title, balance, energy, storage, current goal, and the main action.
3. Exercise one complete loop: inspect or buy, open inventory, list or restore, sleep, and return to the market.
4. Verify that every icon-only action has an accessible label/title and that disabled actions explain why.
5. Remove or simplify the most repetitive visual treatment found; do not redesign unrelated screens speculatively.
6. Run the repository lint/build commands and a browser smoke test after changes.

## Concrete checks

- Wrong: every section uses a rounded dark panel with the same border and shadow.
- Right: reserve panels for meaningful groups, use a simple divider for subordinate groups, and make the primary action visually dominant.
- Wrong: a refresh or settings icon without a label, tooltip, or accessible name.
- Right: provide `title`, `aria-label`, or an adjacent text label that explains the action.
- Wrong: tiny gray text carrying the only explanation for a disabled purchase.
- Right: keep the reason visible next to the disabled action or expose it on focus/hover.
