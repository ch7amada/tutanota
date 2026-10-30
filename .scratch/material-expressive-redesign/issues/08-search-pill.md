# 08: Mail list search pill

**What to build:** On the mail list screen at mobile width, the top bar becomes a rounded search pill: menu button (opens the folder drawer) on the left, "Search in mail" placeholder in the middle, account entry on the right. Tapping the pill opens the existing search view. Other screens keep a normal (restyled) top bar.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] Search pill shown only on the mail list at mobile width
- [x] Menu button opens the drawer; tapping the pill opens search
- [x] Account entry reachable from the pill
- [x] Multiselect header still replaces the bar while selecting
- [x] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** The mobile header of the mail list is now Gmail-like: a collapsed M3 search bar (full pill via `.shape-search-bar`, `surface_container_high`, 56dp, 16dp side margin, 8dp above/below) with the menu button leading, "Search emails" as placeholder and an account avatar trailing; below it a row with the folder name (`title-s-emphasized`) and the existing list actions (filter, multiselect, and in single-column layout the compose action). Typing still happens in the existing search view; the pill only navigates there (`/search/mail`).

**What changed where.**
- `src/ui/base/SearchPill.ts` (new, shared): generic pill with `leading`/`trailing` slots and `searchPillActionStyle` (48px action size). Falls back to a search icon when there is no leading action.
- `src/applications/common/gui/nav/AccountButton.ts` (new): avatar with the user's initial (`primary_container`), labelled "User: <address>", opens a dropdown with address, Settings (internal users) and Switch account, the same entries the drawer has. Initial logic lives in `AccountInitial.ts`.
- `src/applications/mail-app/mail/view/MailListMobileHeader.ts` (new): the header itself. While multiselecting it renders the `MultiselectMobileHeader` in place of the pill, padded to the pill row height so the list does not jump.
- `MailView.ts`: `renderListMobileHeader()` picks the new header for internal users; external users (no search) keep the old `MobileHeader`.
- `MobileHeader.ts`: `MobileHeaderMenuButton` accepts a `style`. `size.ts`: `component_size.search_bar_height = 56`.
- Mobile header is only used below the desktop breakpoint, so desktop is unchanged. In the mobile-desktop (tablet) layout the menu button is omitted because the folder column is visible.

**Accessibility.** Menu, pill and avatar are real buttons with 48px targets and labels (pill's accessible name is its placeholder text, avatar names the account address); keyboard reachable in DOM order. No animation added.

**For later tickets.** Ticket 10: the pill (`data-testid="btn:search_pill"`) routes to `${SEARCH_PREFIX}/mail`. Ticket 09: the compose action is the `primaryAction` passed from `MailView.renderListMobileHeader()`; drop it there.

**Deferred.** No expand/morph animation from pill to search view (search view keeps its own header). Avatar shows an initial, not a profile picture (the app has none).

**Proof.** `mail:types`, `calendar:types`, `drive:types`, `test:types` clean apart from the pre-existing missing `@tutao/mimimi` desktop module error. eslint and prettier clean on changed files. `node make prod` passes (argon2/liboqs sources had to be copied into the worktree's empty submodule dirs, untracked). New `test/tests/gui/nav/AccountInitialTest.ts` passes 4/4 (run via esbuild + otest; full `npm test` needs g++). Login still not possible locally, so the pill, menu button and account button were rendered in a throwaway harness page with the real components and built-in themes and screenshotted in headless Firefox, light and dark: pill, menu icon with news badge, placeholder and avatar look as intended. Not verified in the logged-in app: drawer opening, the actual route to search, multiselect swap and the dropdown.
