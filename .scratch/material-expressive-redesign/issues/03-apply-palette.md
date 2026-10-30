# 03: Apply the chosen palette

**What to build:** The palette chosen in 02 replaces the built-in Mail light and dark themes. Missing M3 roles the redesign needs (e.g. surface-container lowest/low, surface dim/bright, inverse roles) are added. The theme picker, system light/dark following, and Android status/navigation bar colouring keep working. Candidate-switching scaffolding from 02 is removed.

**Blocked by:** 02

**Status:** done

- [x] Mail light/dark built-in themes use the chosen palette
- [x] Added M3 roles available to components
- [x] Theme picker (light/dark/auto) works; auto follows the system
- [x] Android system bars match the new surfaces (verified by reading the code, not on a device)
- [x] Whitelabel/custom themes still load (no crash, missing roles fall back sensibly)
- [x] Shared acceptance criteria in `../spec.md` (only logged-out screens were checked visually, see below)

## Comments

**Where the values live:** candidate A (seed `#850122`, fidelity) is baked into `src/ui/builtinThemes.ts` as static hex values in `lightRed` / `darkRed`, the Mail `light` / `dark` themes (Calendar's `light_secondary` / `dark_secondary` use the same objects). Nothing is generated at runtime, so the default theme doesn't lazy-load `@material/material-color-utilities`. The recipe (scheme setup plus the contrast fix-up below) is `generateMailPalette` in `test/tests/gui/BuiltinThemesTest.ts`. The test regenerates the palette and fails if a baked value drifts, so to change the palette you edit the recipe, run the test and copy the values it reports. Errors now come from the scheme too. The 2025 spec moves the error hue away from a red seed (orange-brown `#9E422C` light / `#FFA089` dark), so errors stay distinguishable from the red primary. `logo` and `state_bg_*` are derived from the new outline colors, as before. Warning/success, illustrations, campaign, Go-European and drive colors are unchanged.

**Roles added** to `Theme`, `MATERIAL_COLORS` and every built-in theme: `inverse_primary`, `surface_dim`, `surface_bright`, `surface_container_lowest`, `surface_container_low`, `inverse_surface`, `inverse_on_surface`, `shadow`. That completes the M3 role set apart from the deprecated `background`/`surface_variant`/`surface_tint`. Components use them through `theme.<role>`. No CSS variables were added, so `main-styles.ts` is untouched.

| Mail | surface / dim / bright | container lowest / low / – / high / highest | on_surface / variant | inverse surface / on / primary |
|---|---|---|---|---|
| light | `#FFF8F7` / `#F4D2D2` / `#FFF8F7` | `#FFFFFF` / `#FFF0F0` / `#FFE9E8` / `#FDE2E2` / `#FADBDB` | `#402E2E` / `#4F4040` | `#130C0D` / `#A79A9A` / `#FF6473` |
| dark | `#130C0D` / `#130C0D` / `#3B2727` | `#000000` / `#1A1111` / `#221717` / `#2A1C1C` / `#332122` | `#FDDEDE` / `#C8B3B2` | `#FFF8F7` / `#5D5352` / `#B12A3E` |

The blue and green themes got the new roles as static values. They are derived from their existing colors with the same rules as the whitelabel fallback, and a test checks that they match.

**Whitelabel / custom themes:** `fillMissingColorRoles` (`src/ui/theme.ts`) derives each new role from the theme's own colors, following M3 tone relations: low = midway surface→container, lowest = white (light) or surface darkened 50% (dark), dim/bright = highest nudged 5% toward on_surface, inverse_surface = on_surface, inverse_on_surface = surface_container, inverse_primary = primary mixed 50% with white/black, shadow = black. It applies only when the customization doesn't set the role itself but does set one of the roles it is derived from. Otherwise the base theme's value stays, so a whitelabel theme that only changes the primary keeps the Mail surfaces. Invalid or missing source colors leave the role alone, so nothing throws. It is called in `ThemeController.assembleTheme` (whitelabel domains, the whitelabel editor preview) and for custom themes loaded from the native theme store. `WhitelabelThemeGenerator` now also outputs the new roles, so newly saved whitelabel themes contain them.

**Contrast:** the shared criterion says "no worse than before". I read it as WCAG conformance level per pair: a pair that reached AAA (7:1) or AA (4.5:1) before must still reach that level. Matching the old ratios exactly would mean the old tones and pure-white surfaces, which isn't M3. The recipe keeps the M3 Expressive (2025 spec, standard contrast) tones and only moves each text role that falls short along its own tonal palette, keeping hue and chroma, until it reaches that level. No global contrast level change (02 rejected that). Roles moved, as tone before → after: light `on_surface_variant` 40→28.5, `on_secondary_container` 35→30.5, `on_tertiary_container` 29→24.5, `on_error_container` 27→12.5, `on_*_fixed_variant` →30.5/24.5. Dark: `secondary` 65→75, `error` 65→75, `on_surface_variant` 70→74.5, `on_primary` 27→23, `on_tertiary` 32→28.5, `on_secondary_container` 77→82.5, `on_tertiary_container` 29→24.5, `on_error_container` 74→89, `on_*_fixed_variant` →30.5/24.5. The test checks every pair, with text roles measured against all eight surface roles.

| WCAG ratio, min over surface…highest | old light | new light | old dark | new dark |
|---|---|---|---|---|
| on_surface | 13.32 | 9.84 (AAA) | 10.36 | 12.07 |
| on_surface_variant | 7.22 | 7.58 (7.01 incl. surface_dim) | 7.12 | 7.63 |
| primary / secondary / error as text | 5.01 / 5.02 / 5.02 | 5.00 / 4.91 / 4.96 | 7.11 / 7.08 / 7.11 | 8.95 / 7.69 / 7.70 |
| outline (non-text) | 3.47 | 3.29 | 3.80 | 3.33 |
| on_primary / primary | 6.45 | 6.09 | 7.76 | 7.03 |
| on_primary_container | 6.64 | 8.05 | 7.22 | 8.05 |
| on_secondary / tertiary / error_container | 7.22 / 7.24 / 7.84 | 7.14 / 7.09 / 7.03 | 7.21 / 7.24 / 7.72 | 7.07 / 7.09 / 7.06 |

Light on_surface drops from 13.3 to 9.8 but stays AAA. Outline stays ≥ 3:1. The non-M3 colors were checked against the new content surfaces (test asserts ≥ 3:1 for icons). Light warning 3.51→3.48, success 3.47→3.45, drive icons ≥ 3.17 (drive_audio, was 3.19); dark all improved. On `surface_dim`, light drive_audio would be 2.93, so icons shouldn't sit on surface_dim.

**Android status/navigation bars (verified by reading the code, not on a device):** `ThemeController.updateSavedBuiltinThemes` pushes every built-in theme to the native `ThemeFacade` on each start. On Android, `AndroidThemeFacade.doApplyTheme` (`app-android/tutashared/.../AndroidThemeFacade.kt`) colors the navigation bar and window background with `surface` and the status bar with `surface_container`, and picks light/dark bar icons from their luminance. The web `theme-color` meta (`src/ui/styles.ts`) also uses `surface_container`. Those are the roles the web header (`.header-nav`: surface_container) and bottom nav (`.bottom-nav`: surface) use today, so with the new palette the bars get `#FFE9E8`/`#FFF8F7` (light) and `#221717`/`#130C0D` (dark) and match the app chrome. No code change was needed. When tickets for the top bar or bottom navigation change those roles (M3: navigation bar = surface_container), `AndroidThemeFacade.kt` (app + calendar), the iOS `ViewController.swift` files and `styles.ts` must change with them. Not changed and left for the Android build ticket: `LIGHT_FALLBACK_THEME` in `AndroidThemeFacade.kt` (`#ffffff` / `#f6f6f6`, used only on first start before themes are saved) and the splash/status colors in `app-android/app/src/main/res/values*/styles.xml`.

**Proof:** `node make prod` passes (includes `mail:types`), as do `calendar:types`, `drive:types` and `test:types`. Node suite: 4935 passing, 1 failing (the known `CalendarEventWhenModel` DST test). As in 02, it ran with temporary runner copies that stub sqlcipher and exclude the offline-DB specs (`OfflineStorage|OfflineDbFacade|offline-v14/15|DesktopCredentialsStorage`), under an English locale. The copies are deleted. New/updated tests: `BuiltinThemesTest` (recipe match, contrast floors, non-M3 icon contrast, blue-theme derivation, `fillMissingColorRoles`), two `ThemeControllerTest` cases (old whitelabel customizations, old saved custom theme), and `CustomColorEditorViewModelTest`'s default source color is now the new primary. Headless Firefox, login screen at 412px: with the preference on Automatic it follows the system (light: body `#FFF8F7`, theme-color `#FFE9E8`, Log in button `#B02A3D`/`#FFF6F5`; dark: `#130C0D`, `#221717`, button `#FFB3B5`/`#74001C`). Picking Dark from "Switch color theme" under a light system switches to dark and stores `dark`. Picking Light Blue renders the blue theme. Desktop width (1280px) looks fine. **Logged-in screens were not seen** (no account in this environment).

**Deferred / notes:** `drive_document` in the red themes is still the old primary `#8F4A4E` (only used by the Drive app, which uses its green themes). The illustration colors (`il_*`) were tuned for the old surfaces and still look fine but weren't redrawn. Print styles use light `surface`, now `#FFF8F7`.
