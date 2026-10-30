# 01: Corner shape scale

**What to build:** A single central M3 shape scale (extra-small 4, small 8, medium 12, large 16, large-increased 20, extra-large 28, extra-large-increased 32, extra-extra-large 48, full) that the whole UI draws its corner radii from. Buttons and chips become pill-shaped; cards, dialogs and bottom sheets get 28px corners; small elements 8–12px. Hard-coded radii in shared components are migrated to the scale. Existing radius names stay as aliases so nothing breaks (expand first, migrate, no forced contraction).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] One place defines the shape scale; shared components read from it
- [ ] All button variants render as pills; chips as pills
- [ ] Cards, dialogs and bottom sheets have 28px corners
- [ ] No remaining hard-coded radius in shared base components (mail-app screens may follow in their own tickets)
- [ ] Shared acceptance criteria in `../spec.md`
