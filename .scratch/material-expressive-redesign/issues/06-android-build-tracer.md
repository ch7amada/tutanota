# 06: Early Android test build

**What to build:** Prove the Android pipeline end-to-end before the redesign lands: Android SDK environment configured, a self-signed keystore created (outside the repo, never committed), and a signed APK of the current branch built and installed on the user's phone with the official application ID. Document the exact build commands for reuse in 16.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Android SDK/adb usable from the shell
- [ ] Keystore stored outside the repository; passwords not committed
- [ ] Signed APK builds from the `redesign` branch
- [ ] APK installs and launches on the user's phone (user uninstalls the official app first); login works
- [ ] Build steps recorded under `## Comments`
