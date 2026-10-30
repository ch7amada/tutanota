# 01: Corner shape scale

**What to build:** A single central M3 shape scale (extra-small 4, small 8, medium 12, large 16, large-increased 20, extra-large 28, extra-large-increased 32, extra-extra-large 48, full) that the whole UI draws its corner radii from. Buttons and chips become pill-shaped; cards, dialogs and bottom sheets get 28px corners; small elements 8–12px. Hard-coded radii in shared components are migrated to the scale. Existing radius names stay as aliases so nothing breaks (expand first, migrate, no forced contraction).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] One place defines the shape scale; shared components read from it
- [x] All button variants render as pills; chips as pills
- [x] Cards, dialogs and bottom sheets have 28px corners
- [x] No remaining hard-coded radius in shared base components (mail-app screens may follow in their own tickets)
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**2026-10-30 (agent, branch `ticket/01-shape-scale`):**

- The scale lives in `src/ui/size.ts`, next to the existing radii: `size.radius_4/8/12/16` (kept as they were) plus new `radius_20/28/32/48` and `radius_full` (9999px = pill/circle); `shape` gives the M3 names (`extra_small` … `extra_extra_large`, `full`), and `component_shape` (mirrors `component_size`) says which step each component kind uses (button/chip = full, fab/menu = large 16, card/dialog/bottom_sheet = extra_large 28, text field/snackbar = small 8, tooltip = extra_small 4).
- `src/ui/main-styles.ts`: new utility classes `.border-radius-20/28/32/48/full` and semantic `.shape-button`, `.shape-chip`, `.shape-fab`, `.shape-card`, `.shape-dialog(-top/-bottom)`, `.shape-bottom-sheet`, `.shape-menu`, `.shape-search-bar`, all generated from `component_shape`. Existing `.border-radius*` classes are unchanged aliases. Every literal radius in main-styles (`25%`, `50%`, `3px`, `px(6)`, `px(8)`, `px(100)`, …) now comes from `shape`/`component_shape`.
- Pills: base buttons sm/md/lg (Primary/Secondary/Tertiary), legacy `Button`, `OutlineButton`, `BannerButton`, login button, icon/toggle icon buttons (now circles), segmented controls, `NavButton`, option-dialog buttons, `FilterChip`, bubbles/keyword bubbles, counter badges, base search bar.
- 28px: all `Dialog` types, `DialogInjectionRight`, `Card` (`.tutaui-card-container`). On phones the `EditLarge` dialog (e.g. mail editor) reaches the bottom screen edge, so only its top corners are rounded there.
- FABs (`FloatingActionButton`, `FabMenu`, `MainCreateButton`) use M3 large (16) rather than a pill, as in M3/Gmail. Menus/dropdowns/popovers use 16.
- Not changed / deferred: there is no bottom-sheet component yet (`.shape-bottom-sheet` is ready for it); folder rows (`SidebarSectionRow`) left at 4 for the folder-drawer ticket; `CircleLoadingBar` left for ticket 15; mail/calendar/drive/settings screens still use the old numeric classes (values from the scale, not changed).
- Proof: `node make prod` OK; `mail:types`, `calendar:types`, `drive:types`, `test:types` 0 errors; eslint/prettier clean on changed files. Checked login page, a dialog (phone, light + dark, and desktop) and a dropdown in headless Firefox. `npm test` could not run on this machine: the test build compiles the native `@signalapp/sqlcipher` addon and `g++` is not installed (unrelated to this change; no test references the changed modules).

**Decision (2026-10-30):** FABs keep the M3 Expressive 16px corner shape (`component_shape.fab`), not pills. User wants the redesign as close to M3 Expressive as possible.
