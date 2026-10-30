# 13: Floating toolbar for mail actions

**What to build:** On mobile, the bottom action bar of the mail viewer (reply, forward, delete, etc.) becomes an M3 Expressive floating toolbar: a rounded, elevated pill floating above the content near the bottom.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] All previous actions available in the floating toolbar (overflow for extras)
- [x] Content can scroll fully past the toolbar
- [x] Safe-area inset respected
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** New reusable `FloatingToolbar` (src/ui/FloatingToolbar.ts): horizontal M3E floating toolbar, *vibrant* colour (`primary_container` container, `on_primary_container` icons) because Gmail-on-Android's viewer toolbar reads as a tinted, clearly-elevated pill rather than a surface-coloured one, and vibrant keeps it distinguishable from the `surface_container` content behind it. Full pill (`component_shape.floating_toolbar` = `shape.full`), elevation level 3 shadow, 64dp tall (`component_size.floating_toolbar_height`), centred, 16dp + `--safe-area-inset-bottom` from the bottom, 48dp icon-button targets, `role="toolbar"`. It takes no layout space; `floatingToolbarClearance()` gives what scrolling content must leave free (toolbar + margin + safe-area inset), computed without any nav-bar height so ticket 10 can restyle the bottom nav freely.

**Changes.**
- `MobileMailActionBar` (mail viewer + mail search result viewer) now renders `FloatingToolbar`; placeholders dropped, the toolbar hugs its buttons. Same actions as before (reply/reply-all, forward, delete/trash, move, more); extras stay in the "more" overflow menu. Dropdown width now follows the view, not the toolbar.
- `ConversationViewer` footer is at least `floatingToolbarClearance()` tall so the last mail scrolls fully past the toolbar.
- `SnackBar` lifts above a shown floating toolbar.
- `ButtonColor.FloatingToolbar`, `.floating-toolbar` styles + state layers in `main-styles.ts`, two tokens in `size.ts`.
- `MobileMailMultiselectionActionBar` is a separate component and was not migrated (out of scope); it can adopt `FloatingToolbar` later, as can contacts/other bottom action bars.

**Accessibility.** 48dp targets, existing labels kept, toolbar role for screen readers, keyboard focus state layer, on_primary_container on primary_container contrast per palette. No animation added.

**Proof.** mail/calendar/drive/test types pass, eslint + prettier clean, `node make prod` succeeds. Not visually verified: login to the local web app doesn't work and no harness screenshot was taken, so light/dark rendering on device is unverified.
