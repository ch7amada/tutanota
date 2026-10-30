# Material 3 Expressive redesign of Tuta Mail (mobile-first)

Agreed in a grilling session on 2026-10-30. Branch: `redesign`, based on tag `tutanota-release-362.261020.0`. Reference look: Gmail on Android (Material 3 Expressive).

## Decisions

- Restyle globally (shared UI code); design and verify at phone width, check the desktop layout doesn't break.
- All five M3 Expressive pillars, in priority order: color, shape, typography, components, motion.
- Keep light + dark themes and following the system setting.
- Color: generated M3 palettes seeded from Tuta red (the existing color-utilities dependency); the chosen palette replaces the built-in Mail light/dark themes. No Android wallpaper (dynamic) color.
- Shape: central M3 shape scale (4, 8, 12, 16, 20, 28, 32, 48, full). Buttons/chips pill, cards/dialogs/sheets 28.
- Typography: keep system font (Roboto on Android); emphasized headings via size/weight only. No bundled font.
- Phased: phase 1 reskin (tokens), phase 2 key screens.
- Stay mergeable with upstream: concentrate changes in the theme layer and shared components; avoid scattering edits.
- Android: keep the official application ID (replaces the official app), self-signed.

## Phase 2 screens

- Extended "New email" FAB that collapses to an icon on scroll; replaces the header compose icon on mobile.
- Mail list top bar becomes a Gmail-style search pill (menu, "Search in mail", account); tapping opens existing search. Mail list only.
- Mail rows: sender initial avatar (generated locally, colour from sender), tapping the avatar selects (flips to ✓, replaces checkbox), unread = bold sender+subject (no dot), roomier spacing, rounded inset selected/open highlight. Still two lines (no body preview exists).
- Bottom navigation: M3E slim bar with pill active indicator; Search removed (Mail, Contacts, Calendar, Drive remain).
- Folder drawer: pill active highlight, rounded edge.
- Mail viewer header: avatar, large emphasized subject, details collapsed until tapped.
- Mail actions: floating rounded toolbar instead of the bottom action bar.
- Motion: one spring easing, used for FAB collapse/expand, button press shape morph, nav indicator, dialog/sheet open. Page transitions unchanged.
- Loading: M3E morphing loading indicator replaces the spinner. No wavy progress bars.

## Non-goals

Wallpaper/dynamic color, bundled custom font, mail body preview in the list, new page transitions, wavy progress indicators, redesigning the separate Calendar/Drive apps (they may inherit shared component styling).

## Acceptance criteria shared by every ticket

- Works in light and dark theme at phone width (< 640px) in the local web app.
- Desktop layout not broken.
- Contrast, touch-target size (≥ 48px) and screen-reader labels no worse than before.
- Existing test suite passes.
