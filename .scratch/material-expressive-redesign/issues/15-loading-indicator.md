# 15: Morphing loading indicator

**What to build:** Replace the current spinner everywhere with the M3 Expressive loading indicator (a shape that continuously morphs between polygons while rotating), themed with the primary colour.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] All spinner usages show the new indicator
- [x] Respects reduced motion (static or gentle fallback)
- [x] Accessible busy/progress semantics preserved
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** New shared component `LoadingIndicator` (`src/ui/base/LoadingIndicator.ts`) renders an SVG whose path morphs through the M3 Expressive sequence (soft burst, 9-sided cookie, pentagon, pill, sunny, 4-sided cookie, oval) while rotating, filled with `theme.primary`. The geometry lives in `src/ui/base/LoadingIndicatorShapes.ts`: each shape is a polar function sampled at the same 80 angles and turned into a closed Catmull-Rom spline (`M` + 80 `C` + `Z`), so every path has the same command structure. The browser interpolates between them with declarative SMIL (`<animate attributeName="d">` plus two `<animateTransform>`: a continuous 4.666 s turn and a stepped turn synced to each 650 ms morph). No timers, no redraws, no new dependency. Paths are computed once, on first use. Each morph uses an emphasized `0.2 0 0 1` spline. SMIL keySplines can't overshoot, so there's no real spring bounce. If 05 ships a spring token, the step easing could be revisited.

**Shared component.** `progressIcon()` in `Icon.ts` now returns `m(LoadingIndicator, { class: "icon-24" })`, so every call site updates without edits: List, Table, ProgressDialog (indeterminate case), MailViewer, MailViewerHeader, MultiItemViewer, ExternalLoginView, PressReleaseEditor, MailRecipientsTextField, CalendarView, CalendarEventEditView, NewsDialog, RecoveryCodeNews, SecondFactorAuthView, SecondFactorEditDialog, NativeWebauthnView, MobileWebauthnView, UserViewer, WhitelabelSettingsViewer, SupportLandingPage, SupportTutaPage.

**Ad-hoc spinners converted** (all were `Icon` with `Icons.Sync` + `.icon-progress`): BaseSearchBar busy state, SelectMailAddressForm, SelectMailAddressFormNew, PasswordRequestDialog, DesktopUpdateHelpLabel, MailExportSettings, and the running-import status icon in ImapImportSettingsViewer. Size classes are unchanged (`icon-24`/`icon-32`/`icon-progress-tiny`/`icon-progress-search`).

**Accessibility.** Same container element (`span.icon`, or `div` where it was a `div`), still `aria-hidden="true"`, no title, like the old icon. Busy labels and texts stay with the callers (e.g. the search bar button label `loading_msg`, "please wait" texts) and are untouched.

**Reduced motion.** With `prefers-reduced-motion: reduce` the indicator renders the static soft-burst shape with only a slow opacity pulse: no rotation or morph. This is checked when the view renders. The one remaining `.icon-progress` user, the decorative rotating gear in ConfigureImapImportPage's title section, is deliberately not a loading indicator; a CSS media rule now stops its rotation under reduced motion.

**Not changed.** Determinate progress (CompletenessIndicator, CircleLoadingBar) and skeleton shimmer are out of scope; the spec has no wavy or progress bar changes.

**Proof.** `node make prod` passes (includes `mail:types`). `calendar:types` and `test:types` are clean. Prettier and eslint are clean on the changed files. The new `test/tests/gui/base/LoadingIndicatorShapesTest.ts` passes 4/4 (identical command structure, stays inside the viewBox while rotating, 7 distinct shapes). The full `npm test` couldn't run on this machine: the test build compiles `@signalapp/sqlcipher` natively and `g++` isn't installed. That's an environment issue, not caused by this change. Headless Firefox showed that the component as rendered by mithril produces correct SMIL attributes and namespaces, that it morphs and rotates over time, and that the reduced-motion pref removes the rotation and morph.
