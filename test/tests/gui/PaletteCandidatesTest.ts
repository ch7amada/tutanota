import o from "@tutao/otest"
import {
	generatePaletteCandidateTheme,
	PALETTE_CANDIDATE_ROLES,
	PALETTE_CANDIDATES,
	paletteCandidateThemeId,
	paletteCandidateThemeOptions,
	parsePaletteCandidateThemeId,
} from "../../../src/ui/paletteCandidates.js"
import { themes } from "../../../src/ui/builtinThemes.js"
import { Theme } from "../../../src/ui/theme.js"
import { hexToRgb, isColorLight } from "../../../src/ui/base/Color.js"

/** WCAG 2 relative luminance */
function luminance(hex: string): number {
	const { r, g, b } = hexToRgb(hex)
	const [lr, lg, lb] = [r, g, b].map((c) => {
		const s = c / 255
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	})
	return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

/** WCAG 2 contrast ratio */
function contrast(a: string, b: string): number {
	const la = luminance(a)
	const lb = luminance(b)
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** [foreground, background] pairs that carry text; M3 requires at least 4.5:1 for them. */
const TEXT_PAIRS: ReadonlyArray<[keyof Theme, keyof Theme]> = [
	...(["primary", "secondary", "tertiary", "error"] as const).flatMap(
		(c): Array<[keyof Theme, keyof Theme]> => [
			[`on_${c}`, c],
			[`on_${c}_container`, `${c}_container`],
		],
	),
	...(["primary", "secondary", "tertiary"] as const).flatMap(
		(c): Array<[keyof Theme, keyof Theme]> => [
			[`on_${c}_fixed`, `${c}_fixed`],
			[`on_${c}_fixed`, `${c}_fixed_dim`],
			[`on_${c}_fixed_variant`, `${c}_fixed`],
			[`on_${c}_fixed_variant`, `${c}_fixed_dim`],
		],
	),
	...(["surface", "surface_container", "surface_container_high", "surface_container_highest"] as const).flatMap(
		(s): Array<[keyof Theme, keyof Theme]> => [
			["on_surface", s],
			["on_surface_variant", s],
			["primary", s],
		],
	),
]

o.spec("paletteCandidates", () => {
	o.test("theme ids round-trip and options cover every candidate in light and dark", () => {
		const options = paletteCandidateThemeOptions()
		o.check(options.length).equals(PALETTE_CANDIDATES.length * 2)
		for (const { value } of options) {
			const parsed = parsePaletteCandidateThemeId(value)!
			o.check(paletteCandidateThemeId(parsed.candidate.id, parsed.base)).equals(value)
		}
		o.check(parsePaletteCandidateThemeId("light")).equals(null)
		o.check(parsePaletteCandidateThemeId("m3candidate_unknown_light")).equals(null)
		o.check(parsePaletteCandidateThemeId("m3candidate_tonal_sepia")).equals(null)
	})

	for (const candidate of PALETTE_CANDIDATES) {
		for (const base of ["light", "dark"] as const) {
			o.spec(`${candidate.id} ${base}`, () => {
				let theme: Theme
				o.before(async () => {
					theme = await generatePaletteCandidateTheme(paletteCandidateThemeId(candidate.id, base), themes()[base])
				})

				o.test("covers every theme role", () => {
					for (const key of Object.keys(themes()[base]) as Array<keyof Theme>) {
						o.check(typeof theme[key]).equals("string")(key)
					}
					for (const role of PALETTE_CANDIDATE_ROLES) {
						o.check(/^#[0-9a-f]{6}$/i.test(theme[role])).equals(true)(`${role}: ${theme[role]}`)
					}
					o.check(theme.themeId).equals(paletteCandidateThemeId(candidate.id, base))
					o.check(isColorLight(theme.surface)).equals(base === "light")
				})

				o.test("text roles meet M3 contrast (>= 4.5:1)", () => {
					for (const [fg, bg] of TEXT_PAIRS) {
						const ratio = contrast(theme[fg], theme[bg])
						o.check(ratio >= 4.5).equals(true)(`${fg} ${theme[fg]} on ${bg} ${theme[bg]}: ${ratio.toFixed(2)}`)
					}
				})

				o.test("outline meets 3:1 against surfaces", () => {
					for (const s of ["surface", "surface_container", "surface_container_high"] as const) {
						const ratio = contrast(theme.outline, theme[s])
						o.check(ratio >= 3).equals(true)(`outline on ${s}: ${ratio.toFixed(2)}`)
					}
				})
			})
		}
	}
})
