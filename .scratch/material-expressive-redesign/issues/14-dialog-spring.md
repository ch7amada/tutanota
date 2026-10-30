# 14: Dialogs and sheets open with a spring

**What to build:** Dialogs and bottom sheets animate in with the spring easing (scale/translate), and out with a quick standard easing.

**Blocked by:** 01, 05

**Status:** done

- [x] Dialogs and bottom sheets use spring on open
- [x] Reduced motion disables the spring
- [x] Focus handling and back-button closing unchanged
- [ ] Shared acceptance criteria in `../spec.md`

## Comments

- Done in one place: `Dialog.show()` / `Dialog.close()` animations in `src/ui/base/Dialog.ts`; no per-dialog changes.
- Open: centred dialogs scale 0.9 → 1 on `default_spatial` while background + content fade on `default_effects` (no overshoot). Edit-large (mobile full-screen / sheet-style) dialogs slide up on `default_spatial`. The inline `transform` is cleared after open so it does not become the containing block of fixed-position children.
- Close: no spring; 150 ms `ease.in` (accelerate) fade, kept below `DefaultAnimationTime` because callers wait on that.
- Reduced motion: `springAnimationOptions` jumps to the end state; close stays a short plain fade.
- Focus, Escape, Android back and modal stacking untouched (only the animation calls changed).
- Verified: build + mail/calendar/drive/test types, eslint, prettier. Not verified in a browser (no headless driver available here).
