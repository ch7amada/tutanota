# 07: Mail list rows

**What to build:** Gmail-style mail rows. A reusable sender initial avatar (colour derived deterministically from the sender, generated locally, no network) at the start of each row. Tapping the avatar toggles selection: it flips to a ✓, replacing the visible checkbox (multiselect and range-select keep working). Unread mails show bold sender and subject instead of the dot. Slightly roomier spacing. The selected/open row gets a rounded, inset, tinted highlight instead of a full-width strip. Still two lines.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Avatar with sender initial and stable colour per sender
- [ ] Tap avatar selects/deselects; ✓ shown when selected; keyboard and screen-reader selection still possible
- [ ] Unread state conveyed by bold text and announced to screen readers
- [ ] Selected/open row has rounded inset highlight
- [ ] Swipe actions and list performance unchanged (no jank scrolling a long inbox)
- [ ] Avatar component reusable by the mail viewer header (12)
- [ ] Shared acceptance criteria in `../spec.md`
