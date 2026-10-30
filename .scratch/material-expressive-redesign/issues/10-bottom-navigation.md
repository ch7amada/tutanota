# 10: Bottom navigation

**What to build:** M3 Expressive slim navigation bar: icons with labels, a pill-shaped active indicator behind the active icon that slides between items with the spring. Search is removed (reachable via the search pill from 08); Mail, Contacts, Calendar and Drive remain.

**Blocked by:** 05, 08

**Status:** ready-for-agent

- [x] Slim bar with pill indicator; indicator animates between items
- [x] Search item removed; search still reachable from the mail list
- [x] Safe-area inset respected on Android edge-to-edge
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** `BottomNav` (src/applications/mail-app/gui/BottomNav.ts) now renders an M3 Expressive short navigation bar itself instead of vertical `NavButton`s: `surface_container` background, no divider, 64dp tall (`component_size.bottom_nav_bar`, now 64) + `--safe-area-inset-bottom` padding as before. Each item is an equal-width `m.route.Link`: 56x32 full-pill icon area over a `label-m` label. Active: `secondary_container` pill, `on_secondary_container` icon, `secondary` label; inactive: `on_surface_variant`. One indicator element slides between items via `translateX` with `springTransition("default_spatial", "transform")` (reduced motion → 0ms). Every view creates its own bar, so the last active index is kept module-level and a new bar starts the indicator there and slides to the new item. On routes with no matching item (settings, search) the indicator fades out.

**Changes.**
- Search item and `getHrefForSearch` removed; mobile search goes through the mail list's search pill (08). External users had no search item before either.
- Items unchanged otherwise: Mail always; Contacts/Calendar for internal users unless disabled; Drive when `isDriveEnabled`.
- `bottom_nav_bar` 50 → 64, plus `bottom_nav_indicator_width/height` in `size.ts`. The constant is shared with the mobile bottom action bars (`.bottom-nav`), the snackbar/overlay offset, `.fixed-bottom-right` and `SearchInPageOverlay`, so they follow automatically and ticket 09's FAB can position against it. `FloatingToolbar` still doesn't depend on it.
- Styles `.bottom-nav-bar`, `.bottom-nav-item*`, `.bottom-nav-indicator*` in `main-styles.ts`; hover/press state layer and focus ring on the icon pill only (M3 behaviour).

**Accessibility.** `aria-current="page"` on the active item, `title` + visible label, whole item height (64dp) and equal-width columns as touch targets, the same `btn:<label>` test ids. There were no badges on the bar before, so none to keep.

**Proof.** eslint + prettier clean on changed files; mail/calendar/drive/test types pass, `node make prod` succeeds. Not visually verified: login to the local web app doesn't work, so the bar couldn't be seen in situ (light/dark, Android inset).
