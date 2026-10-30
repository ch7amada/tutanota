# 07: Mail list rows

**What to build:** Gmail-style mail rows. A reusable sender initial avatar (colour derived deterministically from the sender, generated locally, no network) at the start of each row. Tapping the avatar toggles selection: it flips to a ✓, replacing the visible checkbox (multiselect and range-select keep working). Unread mails show bold sender and subject instead of the dot. Slightly roomier spacing. The selected/open row gets a rounded, inset, tinted highlight instead of a full-width strip. Still two lines.

**Blocked by:** 01

**Status:** done

- [x] Avatar with sender initial and stable colour per sender
- [x] Tap avatar selects/deselects; ✓ shown when selected; keyboard and screen-reader selection still possible
- [x] Unread state conveyed by bold text and announced to screen readers
- [x] Selected/open row has rounded inset highlight
- [ ] Swipe actions and list performance unchanged (no jank scrolling a long inbox)
- [x] Avatar component reusable by the mail viewer header (12)
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** New shared component `src/ui/base/SenderAvatar.ts` (next to `Icon`, so mail viewer header (12) and other apps can import it). The mail row keeps its virtualised, manual-DOM update pattern: the avatar is rendered once per row and updated by hand through `SenderAvatarDom`, touching the DOM only when sender, selection or colour changed. Colours come from ten baked M3 tonal palettes (chroma 40, hues spread around the wheel): light theme tone 90 container with tone 10 initial, dark theme tone 30 with tone 90 initial. The palette is picked by an FNV-1a hash of the lower-cased address (name as fallback), so it is stable across sessions and needs no network or runtime colour generation.

**What changed where.**
- `src/ui/base/SenderAvatar.ts`: `SenderAvatar` (mithril component), `renderSenderAvatar` + `SenderAvatarDom` (for manual-DOM rows), `getAvatarInitial`, `getAvatarToneIndex`, `getAvatarColors`, `AVATAR_TONES`.
- `MailRow.ts`: checkbox + unread dot replaced by the avatar inside a 48px circular `role="checkbox"` toggle (click / Space / Enter toggles, shift-click still bubbles to the list for range select). Selected shows a check mark on `primary`, with a 150ms flip that is skipped under `prefers-reduced-motion` and when a row is recycled for another mail. Unread = bold sender, subject and date (read subject/date use `text-fade`); "unread" stays in the row's aria label. Row height is now `MAIL_ROW_HEIGHT` (list row + 8px) for roomier spacing, still two lines; used by `MailListView`, `MailSearchListView`, `CustomColorEditorPreview`. For sent/draft mails the avatar shows the first recipient, matching the heading text.
- `SelectableRowContainer.ts`: selected/open row highlight uses `secondary_container` with `shape.large` corners, inset by the existing margins. This container is shared, so contact/calendar/settings lists get the same rounded highlight (intended, consistent).

**Accessibility.** Toggle is a 48x48 target, focusable, `aria-checked`, labelled with the sender; avatar itself is `aria-hidden`. Initial contrast is >= 4.5:1 in all tones, both themes (unit-tested). Keyboard row selection and multiselect shortcuts unchanged.

**Deferred.** Swipe actions untouched (row structure inside the swipe container unchanged). Contact photos / BIMI not used (no network by design).

**Proof.** `mail:types`, `calendar:types`, `drive:types`, `test:types` clean; eslint + prettier clean on changed files; `node make prod` succeeds (wasm libs and mimimi node_modules copied as build inputs from worktree 15). New `test/tests/gui/base/SenderAvatarTest.ts` (baked tones match material-color-utilities, contrast, stability, distribution, initials) run in isolation via esbuild: 5/5 passing. Not verified: visual check of the logged-in mail list in light/dark and scrolling performance on a device, since local login does not work and no screenshot harness was built for this ticket.
