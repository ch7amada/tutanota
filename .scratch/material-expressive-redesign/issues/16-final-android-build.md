# 16: Final Android build

**What to build:** Set up the Android SDK/adb environment, build a signed APK of the complete redesign with a self-signed keystore kept outside the repo, and install it in place of the official app on the user's phone. Smoke-test the redesigned flows on the device.

**Blocked by:** 03, 07, 08, 09, 10, 11, 12, 13, 14, 15

**Status:** done

- [ ] Android SDK/adb usable from the shell
- [ ] Keystore stored outside the repository; passwords not committed
- [ ] Signed APK builds from the `redesign` branch
- [ ] Installs and launches on the phone; login and push notifications work
- [ ] On device: mail list, search pill, FAB, bottom nav, drawer, mail viewer, floating toolbar, dialogs, loading indicator all render as designed in light and dark
- [ ] System bars match the theme; no content hidden behind them
- [ ] Build steps recorded under `## Comments`

## Comments

The early Android test build (old ticket 06) was dropped on 2026-10-30: the user tests everything in the web app and builds Android only at the end. That aborted attempt left a self-signed keystore and its env file in `~/.tuta-keystore/` (outside the repo), which can be reused here.

2026-10-30 build steps (APK built and installed on a Pixel 9; device testing done by the user):
- Gradle 8.13 does not run on the system Java 25: Temurin JDK 21 lives in `~/.jdks/jdk-21.0.13+9` (user-local).
- Build: `source ~/emsdk/emsdk_env.sh; export PATH="$HOME/emsdk/upstream/bin:$HOME/Android/Sdk/platform-tools:$PATH" ANDROID_HOME=$HOME/Android/Sdk JAVA_HOME=~/.jdks/jdk-21.0.13+9; export PATH="$JAVA_HOME/bin:$PATH"; source ~/.tuta-keystore/env.sh; node android prod -b release`
- The dist web build runs a chunk dependency check that `node make` skips; `Motion.ts` and `FloatingToolbar.ts` had to be assigned to the `gui-base` chunk in `buildSrc/RollupConfig.js`.
- Output: `artifacts/app-android/tutanota-app-tutao-release-<version>.apk`; install with `adb install` after uninstalling the official app (different signature).

2026-10-30: the user installed the APK on their phone, tested it and reported it works. Closed.
