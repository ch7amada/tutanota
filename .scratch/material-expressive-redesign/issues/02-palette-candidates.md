# 02: Palette candidates from Tuta red

**What to build:** Generate 2–3 candidate light+dark M3 palettes seeded from Tuta red with the existing material color utilities (e.g. one fidelity-style variant keeping the red close to brand, one more vibrant/expressive variant). The user can switch between candidates in the local web app to compare them on real screens. Ends with the user picking one.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] 2–3 candidates, each with light and dark variants, covering every theme role the app uses
- [x] Candidates switchable in the running web app without code edits between them
- [x] Each candidate meets M3 contrast for text on its surfaces
- [x] User has chosen a candidate (record the choice under `## Comments`)

## Comments

**Decision (2026-10-30):** user chose **candidate A · Fidelity** (seed `#850122`, logo red). Ticket 03 applies A as the app palette.

**How to switch (no code edits):** run the web app, log in, open **Settings → Appearance → Color theme**. Below the usual entries there are six extra ones, `M3 candidate A · Fidelity (light)` … `M3 candidate C · Tonal (dark)`. Picking one applies it immediately and it is remembered across reloads (stored like any other theme preference). Pick `Light` / `Dark` / `Automatic` to go back. The entries only appear in the Mail app (not Calendar/Drive).

**Implementation:** `src/ui/paletteCandidates.ts` generates every candidate at runtime with the repo's `@material/material-color-utilities` (tutao fork, 2025 color spec, `DynamicScheme`, standard contrast level 0; same lazy import as `WhitelabelThemeGenerator`). The fork has no `SchemeFidelity`/`SchemeVibrant`/`SchemeTonalSpot` classes, so each candidate passes its own tonal palettes modelled on the upstream scheme variants. `ThemeController.getTheme` resolves the `m3candidate_<id>_<light|dark>` theme ids; `AppearanceSettingsViewer` lists them. All 37 M3 roles the `Theme` type has (primary/secondary/tertiary incl. container + fixed roles, surface + 3 containers, on_surface(_variant), outline(_variant), scrim, error ×4) come from the scheme; `state_bg_*` and the logo are derived from the generated outline colors like in the built-in themes; the non-M3 roles (warning/success, illustrations, campaign, drive icons) come from the built-in Mail theme of the same brightness. Ticket 03 removes this scaffolding.

Seeds (HCT hue / chroma / tone): Tuta logo red `#850122` (15.9 / 70.4 / 27.1), Tuta accent red `#D93951` (15.2 / 78.3 / 49.8).

| Candidate | Seed | Variant (palettes) |
|---|---|---|
| **A · Fidelity** | `#850122` | Fidelity-style: primary keeps the seed chroma; **primary_container is the logo red itself** in both light and dark (on-container tone 90); secondary = seed hue, chroma max(c−32, c/2); tertiary hue +60; neutrals chroma 5/8 (slightly warm surfaces) |
| **B · Vibrant** | `#D93951` | Vibrant-style: primary chroma 200 (max), secondary hue +18° chroma 24, tertiary hue +35° chroma 32 (upstream SchemeVibrant rotations); neutrals chroma 3.5/6 |
| **C · Tonal** | `#D93951` | Tonal-spot-style (Android default): primary chroma 36, secondary 16, tertiary hue +60 chroma 24, neutrals chroma 2/4 (near-neutral surfaces). Light primary comes out as `#8f4a4e`, identical to today's Mail theme primary — this is the "current look, full M3 roles" option |

Key hex values:

| | primary / on | primary_container / on | secondary_container | tertiary | surface | surface_container | surface_container_highest | on_surface | on_surface_variant | outline |
|---|---|---|---|---|---|---|---|---|---|---|
| A light | `#b02a3d` / `#fff6f5` | `#850122` / `#ffdada` | `#ffdada` | `#7f5713` | `#fff8f7` | `#ffe9e8` | `#fadbdb` | `#402e2e` | `#705a5a` | `#8d7575` |
| A dark | `#ffb3b5` / `#850122` | `#850122` / `#ffdada` | `#66262c` | `#ffd396` | `#130c0d` | `#221717` | `#332122` | `#fddede` | `#c0a5a5` | `#887070` |
| B light | `#be0037` / `#fff6f5` | `#ffdada` / `#a6002f` | `#ffdbd1` | `#88512e` | `#fff8f7` | `#fbeaea` | `#f3dddd` | `#3c2f2f` | `#6b5b5b` | `#887777` |
| B dark | `#ffb3b6` / `#850023` | `#920028` / `#ffc1c3` | `#593026` | `#ffc9aa` | `#120d0d` | `#201718` | `#2f2323` | `#f6e0e0` | `#baa6a7` | `#837172` |
| C light | `#8f4a4e` / `#fff6f5` | `#ffdada` / `#803d42` | `#ffdada` | `#775a30` | `#fff8f7` | `#f6ebeb` | `#eddfdf` | `#383131` | `#665d5d` | `#837878` |
| C dark | `#ffb3b6` / `#6a2c32` | `#723338` / `#ffc1c3` | `#503435` | `#ffe7cb` | `#100d0d` | `#1d1818` | `#2b2424` | `#f0e2e2` | `#b4a8a8` | `#7d7373` |

Contrast (WCAG 2 ratio, minimum over the group; M3 asks ≥ 4.5 for text, ≥ 3 for outline). Checked automatically by `test/tests/gui/PaletteCandidatesTest.ts`:

| | on-X on X (pri/sec/ter/error + containers) | on-fixed(-variant) on fixed(-dim) | on_surface on surface…highest | on_surface_variant on surface…highest | primary on surface…highest | outline on surface…high |
|---|---|---|---|---|---|---|
| A light | 4.57 | 4.53 | 9.84 | 4.92 | 5.00 | 3.48 |
| A dark | 4.57 | 4.53 | 12.07 | 6.64 | 8.95 | 3.59 |
| B light | 4.57 | 4.55 | 9.88 | 4.95 | 4.99 | 3.47 |
| B dark | 4.57 | 4.55 | 12.02 | 6.57 | 8.93 | 3.57 |
| C light | 4.57 | 4.54 | 9.82 | 4.93 | 4.98 | 3.48 |
| C dark | 4.57 | 4.54 | 12.08 | 6.60 | 8.96 | 3.57 |

(The 4.57 minimum is on_error_container; primary/secondary/tertiary on-colors are all ≥ 6.0.)

**Proof:** `node make prod` (includes `mail:types`) and `npm run test:types` pass. Unit tests (`PaletteCandidatesTest`, `ThemeControllerTest`) pass; whole node suite: 4860 passing, 1 failing (`CalendarEventWhenModel` DST test, fails identically on the base commit). The suite had to run with sqlcipher stubbed and the offline-DB specs excluded because this machine has no `g++` to build the native module. Headless Firefox at 412px with each candidate id as the stored theme preference: the login screen renders with the candidate's surface and primary (e.g. A light: body `#fff8f7`, button `#b02a3d`; B dark: body `#120d0d`, button `#ffb3b6`).

**Note for 03:** compared with today's hand-tuned Mail themes, standard-contrast M3 lowers on_surface_variant on surfaces (today 7.22 light / 7.12 dark → ~4.9 light / ~6.6 dark) and on_surface in light (13.3 → 9.8); primary is unchanged (5.0 light) and dark on_surface improves (10.4 → 12.1). All still meet M3, but if "contrast no worse than before" is applied strictly, 03 should darken on_surface_variant (e.g. a fixed lower tone). Raising the whole scheme's contrast level to 0.5 was tried and rejected: it turns containers into mid-tone fills (e.g. vibrant primary_container `#e80045`), which no longer looks like M3 Expressive.

Known gaps of the temporary candidate themes (fine for comparing, handled by 03 replacing the built-in themes): a few campaign-only spots compare `themeId === "light"` (Go-European border colour) and the unsubscribe-image suffix picks the light image for candidate ids; on desktop/native the candidates are not pushed to the native theme store, so system-bar colouring there falls back to whatever the native side has saved (not tested; the web app is the target).
