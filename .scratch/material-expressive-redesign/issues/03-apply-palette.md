# 03: Apply the chosen palette

**What to build:** The palette chosen in 02 replaces the built-in Mail light and dark themes. Missing M3 roles the redesign needs (e.g. surface-container lowest/low, surface dim/bright, inverse roles) are added. The theme picker, system light/dark following, and Android status/navigation bar colouring keep working. Candidate-switching scaffolding from 02 is removed.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Mail light/dark built-in themes use the chosen palette
- [ ] Added M3 roles available to components
- [ ] Theme picker (light/dark/auto) works; auto follows the system
- [ ] Android system bars match the new surfaces
- [ ] Whitelabel/custom themes still load (no crash, missing roles fall back sensibly)
- [ ] Shared acceptance criteria in `../spec.md`
