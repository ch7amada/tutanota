# 09: "New email" floating button

**What to build:** An extended FAB "New email" (pencil icon + label) bottom-right above the bottom navigation on mobile. It collapses to the icon when scrolling down the list and expands on scrolling up, animated with the spring. The compose icon in the mobile header is removed. Builds on the existing floating action button component.

**Blocked by:** 01, 05

**Status:** ready-for-agent

- [x] FAB visible on the mail list at mobile width; opens the composer
- [x] Collapses on scroll down, expands on scroll up, with spring motion
- [x] Header compose icon removed on mobile only
- [x] FAB does not cover the last row (list has bottom padding)
- [x] Accessible label when collapsed
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

- `FloatingActionButton` (src/ui/base/) gained an extended variant: pass `text` (visible label) and optionally `collapsed`. It is M3E: 56px tall, 16px corners (`shape-fab`), `primary_container` / `on_primary_container`, 24px icon, 12px icon-label gap. Collapsing animates the label's max-width/margin/opacity with `springTransition("default_spatial", ...)`, so reduced motion makes it instant. `title` stays the accessible name (button `title`) when collapsed. It is a real `<button>`, keyboard reachable, at least 56x56.
- `FabScrollState` (same file) holds the scroll-direction logic: collapse after more than 8px scrolled down, expand after more than 8px up or at the top. Distance is measured from the last decision point, so slow scrolling still counts. Tested in `test/tests/gui/base/FabScrollStateTest.ts`.
- `MailView.renderNewMailFab()` renders it via `BackgroundColumnLayout.floatingActionButton` (same slot calendar uses, `fab-position`), only with bottom navigation, `isNewMailActionAvailable()` and outside multiselect. Click = same `showNewMailDialog()` as the header button did. Scroll is read with a capture-phase listener on the list wrapper. The state resets when the folder changes.
- The mobile list headers (`MailListMobileHeader`, plain `MobileHeader` for external users) no longer get the compose `primaryAction`. The desktop folder-column button and the mail viewer header are unchanged.
- `List` has a new optional `bottomSpacing` attr (padding below the last row). `MailListView` passes FAB height + 2x16px while `isFabShown()`.
- Bottom nav height is not hard-coded: the FAB sits in the list column like calendar's FAB.
- Not verified visually: local login does not work, so the FAB was not seen in the running app. Checked: types for all apps, eslint/prettier, prod build.
