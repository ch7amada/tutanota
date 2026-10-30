# 05: Spring motion and button press shape change

**What to build:** A small spring easing (usable by both the JS animation engine and CSS transitions) and its first use: buttons briefly change shape when pressed (pill corners tighten on press and spring back), the M3 Expressive signature interaction. Respects reduced-motion preferences.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Spring easing available to JS animations and CSS
- [ ] Pressing any standard button visibly morphs its shape and springs back
- [ ] With reduced motion enabled, no spring/morph animation plays
- [ ] Unit test for the spring easing curve (bounds, settles at 1)
- [ ] Shared acceptance criteria in `../spec.md`
