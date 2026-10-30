# 16: Final Android build

**What to build:** Set up the Android SDK/adb environment, build a signed APK of the complete redesign with a self-signed keystore kept outside the repo, and install it in place of the official app on the user's phone. Smoke-test the redesigned flows on the device.

**Blocked by:** 03, 07, 08, 09, 10, 11, 12, 13, 14, 15

**Status:** ready-for-agent

- [ ] Android SDK/adb usable from the shell
- [ ] Keystore stored outside the repository; passwords not committed
- [ ] Signed APK builds from the `redesign` branch
- [ ] Installs and launches on the phone; login and push notifications work
- [ ] On device: mail list, search pill, FAB, bottom nav, drawer, mail viewer, floating toolbar, dialogs, loading indicator all render as designed in light and dark
- [ ] System bars match the theme; no content hidden behind them
- [ ] Build steps recorded under `## Comments`

## Comments

The early Android test build (old ticket 06) was dropped on 2026-10-30: the user tests everything in the web app and builds Android only at the end. That aborted attempt left a self-signed keystore and its env file in `~/.tuta-keystore/` (outside the repo), which can be reused here.
