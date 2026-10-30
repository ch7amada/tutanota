# 09: "New email" floating button

**What to build:** An extended FAB "New email" (pencil icon + label) bottom-right above the bottom navigation on mobile. It collapses to the icon when scrolling down the list and expands on scrolling up, animated with the spring. The compose icon in the mobile header is removed. Builds on the existing floating action button component.

**Blocked by:** 01, 05

**Status:** ready-for-agent

- [ ] FAB visible on the mail list at mobile width; opens the composer
- [ ] Collapses on scroll down, expands on scroll up, with spring motion
- [ ] Header compose icon removed on mobile only
- [ ] FAB does not cover the last row (list has bottom padding)
- [ ] Accessible label when collapsed
- [ ] Shared acceptance criteria in `../spec.md`
