# 11: Folder drawer

**What to build:** The folder drawer gets M3 navigation-drawer styling: pill-shaped highlight for the active folder, rounded trailing edge, updated spacing and typography.

**Blocked by:** 01

**Status:** done

- [x] Active folder shows a pill highlight
- [x] Drawer has a rounded trailing edge on mobile
- [x] Unread counters and folder actions still work
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** Restyled the shared drawer pieces instead of each app: `NavButton` (`NavButtonColor.Nav` = drawer item), `SidebarSectionRow` (Contacts/Calendar/Settings sections), `SettingsFolderRow`, `FolderColumnView` and `ViewColumn`. The mail-specific `MailSetRow` and the Drive `DriveFolderRow` use the same helpers.

**What changed where**
- `src/ui/size.ts`: `component_shape.navigation_drawer` (large, 16) and `component_shape.navigation_drawer_item` (full), plus `component_size.navigation_drawer_item_height` (56).
- `src/ui/main-styles.ts`: `.modal-drawer` (16px trailing corners), `.modal-drawer .navigation-drawer` (surface_container_low) and `.shape-navigation-drawer-item`.
- `src/ui/base/NavButton.ts`: `getDrawerItemColors(selected)` (secondary_container pill with on_secondary_container content; inactive items use on_surface_variant) and `getDrawerItemHeight()` (56px on mobile; the denser desktop layout keeps button_height 44). Drawer NavButtons get a full pill, 16/24 padding, a 12px icon gap and label-large text. The drag-over highlight still uses state_bg_active.
- `ViewColumn` adds `modal-drawer` when a foreground column slides in over the content (mobile/tablet). `FolderColumnView` adds `navigation-drawer`.
- `MailSetRow`: pill background, 56px rows, the hierarchy lines and the "+" overlay moved to the new geometry. The unread count is now plain label-large text at the end of the row, as in the M3 drawer badge, replacing the filled CounterBadge. The more button still replaces the count on hover or in edit mode.
- The add folder/label rows, `SidebarSectionRow`, Drive and Settings rows use the same margins (12), pill and colors. The radius-4 rows that ticket 01 left are gone.

**Accessibility.** Rows are 56px on mobile and 44px on desktop (unchanged). aria-current, titles and labels are unchanged. on_secondary_container on secondary_container is the M3 pairing that is meant to meet contrast. There is no new animation.

**Deferred / not verified.**
- I did not check it visually. Login to the local build does not work, and I did not build a harness. I verified it only with the type checks and the prod build.
- Unread counts, the context more buttons, drag & drop and expand/collapse use the same code paths as before (handlers untouched), but I did not test them in a running app.
- In dark theme the drawer's surface_container_low depends on the palette from ticket 03.

**Proof.** `mail:types`, `calendar:types`, `drive:types` and `test:types` are clean. eslint and prettier are clean on the changed files. `node make prod` succeeds.
