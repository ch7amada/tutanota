# 04: Emphasized typography

**What to build:** Headings and titles follow an M3 Expressive-style type scale (larger, bolder display/headline/title sizes) using the system font. Body text stays readable and unchanged in size.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Central type scale for display/headline/title/body/label roles
- [x] View titles, dialog titles and section headers use the emphasized roles
- [x] No text truncation regressions at phone width
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Type scale** lives in `src/ui/size.ts` as `type_scale` (next to the existing `font_size`; body roles reuse `font_size.base/smaller/small`, so body text is unchanged). `src/ui/main-styles.ts` generates a `.<role>` and `.<role>-emphasized` class per role (`typeRoleStyle()` is exported for components that need inline styles).

| role | size/line height (px) | weight / emphasized |
| --- | --- | --- |
| display-l/m/s | 57/64, 45/52, 36/44 | 400 / 500 |
| headline-l/m/s | 32/40, 28/36, 24/32 | 400 / 500 |
| title-l | 22/28 | 400 / 600 |
| title-m/s | 16/24, 14/20 | 500 / 600 |
| body-l/m/s | 16/24, 14/20, 12/16 | 400 / 500 |
| label-l/m/s | 14/20, 12/16, 11/16 | 500 / 600 |

Emphasized = one weight step bolder; 600 for title/label matches the weight headers already used (`.font-weight-600`). Roboto has no 600 face, so on Android these render bold.

**Migrated:**
- `h1`-`h6` / `.h1`-`.h6` now map to headline-l, headline-m, headline-s, title-l, title-m, title-s (all emphasized, previously regular weight). `.h4` is the settings section header, so all settings sections pick this up.
- Mobile view title (`MobileHeaderTitle`, used by mail, contacts, settings, calendar, drive): title-l emphasized (22px, was 16px/600). If the title does not fit, it falls back to title-m emphasized (16px/600, the old style), so nothing truncates that fit before.
- Multiselect mobile header ("N selected"): title-l emphasized.
- Dialog header bar title: title-m emphasized. It stays 16px because the centered title only gets the middle third of the bar, and 22px would truncate titles at phone width.
- Reminder dialog title: headline-s emphasized (the M3 dialog headline role, was `.h2`).
- Sidebar section headers (`SidebarSection`) and `MenuTitle`: title-s emphasized, sentence case instead of 12px bold UPPERCASE.

**Truncation check:** I couldn't log in to the local web app, so I couldn't screenshot real views. Instead I rendered the header and sidebar layouts in a headless Firefox page at 390px with German and English titles (folders, settings sections, calendar months, sidebar sections, long e-mail addresses), comparing the old style with the new one. Nothing truncated with the new style that hadn't truncated before. In the built app at 390px (headless Firefox, logged out):
- The "Recover" dialog title renders at 16px/600, and the header bar keeps its 44px line height.
- Signup headings (`h1.h3`, prices `.h1`) render at the new sizes and weights without overflow.

**Proof:** `npm run mail:types`, `calendar:types`, `drive:types`, `test:types` and eslint on the changed files all pass, and `node make prod` builds. I couldn't run the test suite here: its build compiles the native `@signalapp/sqlcipher` addon, which needs `g++`, and this machine has no C++ compiler.

**Deferred:**
- A larger dialog title needs a header bar layout change (left-aligned title as in M3). That belongs to the components work.
- `yourFolders_action` is uppercase in the translations themselves ("YOUR FOLDERS"), so that one section header stays uppercase.
- `TitleSection` keeps its inline 20px title.
- Display roles are defined but not used yet (meant for phase 2, e.g. the large subject in the mail viewer).
