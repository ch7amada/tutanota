# 05: Spring motion and button press shape change

**What to build:** A small spring easing (usable by both the JS animation engine and CSS transitions) and its first use: buttons briefly change shape when pressed (pill corners tighten on press and spring back), the M3 Expressive signature interaction. Respects reduced-motion preferences.

**Blocked by:** 01

**Status:** done

- [x] Spring easing available to JS animations and CSS
- [x] Pressing any standard button visibly morphs its shape and springs back
- [x] With reduced motion enabled, no spring/morph animation plays
- [x] Unit test for the spring easing curve (bounds, settles at 1)
- [x] Shared acceptance criteria in `../spec.md`

## Comments

**Approach.** One module, `src/ui/animation/Motion.ts`, holds the M3 Expressive spring tokens (`spring_tokens`: `fast_spatial` 0.6/800, `default_spatial` 0.8/380, `slow_spatial` 0.8/200, `fast_effects`/`default_effects`/`slow_effects` damping 1 with stiffness 3800/1600/800) and derives everything from the analytic damped-spring solution: a JS `EasingFunction` for `Animations`, a settle duration, and a CSS `linear()` string (sampled, simplified to a 0.002 tolerance). CSS uses custom properties on `:root`: `--motion-<token>` (easing) and `--motion-<token>-duration`, with `cubic-bezier(0.2, 0, 0, 1)` as fallback where `@supports (linear(...))` fails. Consumers use `springTransition(token, ...props)` for CSS and `springAnimationOptions(token)` for JS.

**Press morph.** Done centrally in `buttonPressMorphStyles()` (main-styles.ts): legacy `.shape-button` buttons, the variant buttons (`base-button-sm/md/lg`), and icon buttons (but not the large FAB) rest at radius = height/2. That's still a pill, but the transition now has a finite start value. On `:active` they go to `component_shape.button_pressed(height)` (size.ts: small ≤40px, medium ≤56px, large above) and spring back with `fast_spatial`. `VariantButtons` adds the radius transition to its inline transition.

**Reduced motion.** `prefersReducedMotion()` in Motion.ts is now the single check (LoadingIndicator was switched to it). The pressed rules only apply under `prefers-reduced-motion: no-preference`, and under `reduce` all `--motion-*-duration` are 0ms. `springAnimationOptions` jumps to the end.

**Accessibility.** Only corner radius changes. Sizes, touch targets, colours and focus are unchanged.

**Deferred.** LoadingIndicator morph easing still uses its keySpline (SMIL can't take `linear()`). The FAB press morph is left to ticket 09.

**Proof.** `mail:types`, `calendar:types`, `drive:types`, `test:types` clean. Prettier and eslint clean on changed files. `node make prod` passes. `test/tests/gui/animation/MotionTest.ts` passes 13/13 (bundled with esbuild and run with node, like ticket 15): starts at 0, settles to 1, overshoot ≤10% for spatial, none for effects, durations ordered, `linear()` well-formed and close to the spring, helpers and reduced motion. Harness page in headless Firefox: rest and pressed shapes at 32/40/56/96px, and Firefox accepts the generated `linear()`. Not verified: the live `:active` interaction in the running app (no login, and headless screenshots can't press), Safari fallback path, dark theme (no colour changes made).
