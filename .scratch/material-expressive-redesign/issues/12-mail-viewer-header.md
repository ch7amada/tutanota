# 12: Mail viewer header

**What to build:** When reading an email: large emphasized subject line, sender row with the avatar from 07, and recipient/details collapsed until tapped.

**Blocked by:** 04, 07

**Status:** ready-for-agent

- [x] Subject uses the emphasized headline style
- [x] Sender avatar matches the one in the mail list
- [x] Details collapsed by default, expand on tap, accessible as a toggle
- [x] Security indicators (e.g. phishing/encryption warnings) remain visible
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Approach:** Gmail-on-Android reading layout with the existing building blocks only (no new tokens).

- `MailViewer.ts`: the subject now renders *above* the header and uses `.headline-s-emphasized` (type scale from 04) instead of `h4.font-weight-600`; still an `h4` for the document outline.
- `MailViewerHeader.ts`:
  - Sender row starts with ticket 07's `SenderAvatar` (40px, built from `getDisplayedSender()`, so same initial/colour as the mail list for that sender). It is aria-hidden; the sender name next to it labels the row.
  - The lines below (sender address, "to: me +2 ▾", date) are indented to line up with the name.
  - Details toggle: before, the whole address block was a `div role=button` with both `aria-pressed` and `aria-expanded`. Now only the compact "to: … +n ▾" part is a real `<button>` with `aria-expanded`, a 48px minimum height and the state layer (`state-bg`). Enter/Space come from the browser. If there is no relevant recipient it shows "Details ▾". Details (all recipients, full addresses, envelope sender) start collapsed, as before, in the existing `ExpanderPanel`.
  - Security and state indicators are outside the collapsed part: the confidential icon, folder icon and date in the row; the phishing, authentication-failure, deprecated-key, external-content, newsletter, scheduled-send and connection-lost banners below it.
- Collapse-mail and "more" actions in the sender row are unchanged. Floating toolbar (13) is not touched. No motion was added; the expander keeps its existing behaviour.

**Accessibility:** the toggle is a native button with `aria-expanded`, keyboard focusable and at least 48px tall. The avatar is decorative. Colours are `on_surface_variant`/`on_surface` theme roles.

**Deferred / risks:** in conversations every expanded mail still shows its own subject (as before), now at the larger size. A single conversation-level subject would be a follow-up. The date stays a separate line under the toggle rather than Gmail's inline "name · date".

**Proof:** `npm run mail:types` clean (after the build had produced its inputs), eslint and prettier clean on the changed files, `node make prod` succeeds. **Not verified visually:** login to the local web app does not work, so the logged-in mail viewer could not be screenshotted in light/dark, phone/desktop. No unit tests added (no non-trivial logic).
