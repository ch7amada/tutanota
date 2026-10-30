/**
 * @file Candidate Material 3 palettes seeded from Tuta red (redesign ticket 02).
 *
 * Each candidate is exposed as two extra selectable themes (light + dark) so the candidates can be compared on real screens
 * via Settings → Appearance → Color theme. This is temporary scaffolding: once a candidate is chosen it replaces the
 * built-in Mail themes (ticket 03) and this file goes away.
 *
 * All Material roles are generated with @material/material-color-utilities (same library and contrast level handling as
 * WhitelabelThemeGenerator). Roles the app has that are not part of the M3 scheme (warning/success, illustrations, campaign,
 * drive icons) are taken from the built-in Mail theme of the same brightness.
 */
import type { TonalPalette as TonalPaletteType } from "@material/material-color-utilities"
import type { BaseThemeId, Theme, ThemeId } from "./theme"
import { getAppLogo } from "./base/Logo"

/** Tuta logo signet red. */
export const TUTA_LOGO_RED = "#850122"
/** Tuta accent red (used for the "nota" brand accent). */
export const TUTA_ACCENT_RED = "#D93951"

export type PaletteCandidateId = "fidelity" | "vibrant" | "tonal"

export interface PaletteCandidate {
	readonly id: PaletteCandidateId
	readonly label: string
	readonly seed: string
}

export const PALETTE_CANDIDATES: ReadonlyArray<PaletteCandidate> = Object.freeze([
	{ id: "fidelity", label: "A · Fidelity", seed: TUTA_LOGO_RED },
	{ id: "vibrant", label: "B · Vibrant", seed: TUTA_ACCENT_RED },
	{ id: "tonal", label: "C · Tonal", seed: TUTA_ACCENT_RED },
])

const THEME_ID_PREFIX = "m3candidate"

export function paletteCandidateThemeId(candidate: PaletteCandidateId, base: BaseThemeId): ThemeId {
	return `${THEME_ID_PREFIX}_${candidate}_${base}`
}

export function parsePaletteCandidateThemeId(themeId: ThemeId): { candidate: PaletteCandidate; base: BaseThemeId } | null {
	const [prefix, candidateId, base, ...rest] = themeId.split("_")
	if (prefix !== THEME_ID_PREFIX || rest.length > 0 || (base !== "light" && base !== "dark")) return null
	const candidate = PALETTE_CANDIDATES.find((c) => c.id === candidateId)
	return candidate ? { candidate, base } : null
}

/** Options for the theme selector, one per candidate and brightness. */
export function paletteCandidateThemeOptions(): Array<{ name: string; value: ThemeId }> {
	return PALETTE_CANDIDATES.flatMap((candidate) =>
		(["light", "dark"] as const).map((base) => ({
			name: `M3 candidate ${candidate.label} (${base})`,
			value: paletteCandidateThemeId(candidate.id, base),
		})),
	)
}

/** All M3 scheme roles that the app's {@link Theme} has. */
export const PALETTE_CANDIDATE_ROLES = Object.freeze([
	"primary",
	"on_primary",
	"primary_container",
	"on_primary_container",
	"primary_fixed",
	"on_primary_fixed",
	"primary_fixed_dim",
	"on_primary_fixed_variant",
	"secondary",
	"on_secondary",
	"secondary_container",
	"on_secondary_container",
	"secondary_fixed",
	"on_secondary_fixed",
	"secondary_fixed_dim",
	"on_secondary_fixed_variant",
	"tertiary",
	"on_tertiary",
	"tertiary_container",
	"on_tertiary_container",
	"tertiary_fixed",
	"on_tertiary_fixed",
	"tertiary_fixed_dim",
	"on_tertiary_fixed_variant",
	"surface",
	"surface_container",
	"surface_container_high",
	"surface_container_highest",
	"on_surface",
	"on_surface_variant",
	"outline",
	"outline_variant",
	"scrim",
	"error",
	"on_error",
	"error_container",
	"on_error_container",
] as const satisfies ReadonlyArray<keyof Theme>)

export type PaletteCandidateColors = Record<(typeof PALETTE_CANDIDATE_ROLES)[number], string>

/**
 * Generate the M3 roles of a candidate.
 *
 * The scheme always uses the standard contrast level (0), which in the library's 2025 spec guarantees
 * >= 6:1 for on-colors on their containers, >= 9:1 for on_surface and >= 4.5:1 for on_surface_variant and primary.
 */
export async function generatePaletteCandidateColors(candidateId: PaletteCandidateId, isDark: boolean): Promise<PaletteCandidateColors> {
	const { argbFromHex, hexFromArgb, Contrast, CorePalette, DynamicScheme, Hct, TonalPalette } = await import("@material/material-color-utilities")

	const candidate = PALETTE_CANDIDATES.find((c) => c.id === candidateId)!
	const sourceArgb = argbFromHex(candidate.seed)
	const source = Hct.fromInt(sourceArgb)

	let palettes: Record<"primary" | "secondary" | "tertiary" | "neutral" | "neutralVariant", TonalPaletteType>
	switch (candidateId) {
		case "fidelity": {
			// Like M3 SchemeFidelity: keep the seed's own chroma so the reds stay close to the brand.
			const core = CorePalette.contentOf(sourceArgb)
			palettes = {
				primary: core.a1,
				secondary: TonalPalette.fromHueAndChroma(source.hue, Math.max(source.chroma - 32, source.chroma * 0.5)),
				tertiary: core.a3,
				// The library's 2025 spec multiplies neutral chroma by up to 2.2 for surface containers, so the neutral chroma is kept
				// well below SchemeFidelity's chroma / 8 to avoid pink surfaces.
				neutral: TonalPalette.fromHueAndChroma(source.hue, 5),
				neutralVariant: TonalPalette.fromHueAndChroma(source.hue, 8),
			}
			break
		}
		case "vibrant": {
			// Like M3 SchemeVibrant: maximum-chroma primary, secondary/tertiary slightly rotated warm hues.
			const hues = [0, 41, 61, 101, 131, 181, 251, 301, 360]
			palettes = {
				primary: TonalPalette.fromHueAndChroma(source.hue, 200),
				secondary: TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(source, hues, [18, 15, 10, 12, 15, 18, 15, 12, 12]), 24),
				tertiary: TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(source, hues, [35, 30, 20, 25, 30, 35, 30, 25, 25]), 32),
				neutral: TonalPalette.fromHueAndChroma(source.hue, 3.5),
				neutralVariant: TonalPalette.fromHueAndChroma(source.hue, 6),
			}
			break
		}
		case "tonal": {
			// Like M3 SchemeTonalSpot (the Android default): a muted primary, low-chroma accents and near-neutral surfaces.
			palettes = {
				primary: TonalPalette.fromHueAndChroma(source.hue, 36),
				secondary: TonalPalette.fromHueAndChroma(source.hue, 16),
				tertiary: TonalPalette.fromHueAndChroma(source.hue + 60, 24),
				neutral: TonalPalette.fromHueAndChroma(source.hue, 2),
				neutralVariant: TonalPalette.fromHueAndChroma(source.hue, 4),
			}
			break
		}
	}

	const scheme = new DynamicScheme({
		sourceColorHct: source,
		contrastLevel: 0,
		isDark,
		primaryPalette: palettes.primary,
		secondaryPalette: palettes.secondary,
		tertiaryPalette: palettes.tertiary,
		neutralPalette: palettes.neutral,
		neutralVariantPalette: palettes.neutralVariant,
	})

	const colors: PaletteCandidateColors = {
		primary: hexFromArgb(scheme.primary),
		on_primary: hexFromArgb(scheme.onPrimary),
		primary_container: hexFromArgb(scheme.primaryContainer),
		on_primary_container: hexFromArgb(scheme.onPrimaryContainer),
		primary_fixed: hexFromArgb(scheme.primaryFixed),
		on_primary_fixed: hexFromArgb(scheme.onPrimaryFixed),
		primary_fixed_dim: hexFromArgb(scheme.primaryFixedDim),
		on_primary_fixed_variant: hexFromArgb(scheme.onPrimaryFixedVariant),
		secondary: hexFromArgb(scheme.secondary),
		on_secondary: hexFromArgb(scheme.onSecondary),
		secondary_container: hexFromArgb(scheme.secondaryContainer),
		on_secondary_container: hexFromArgb(scheme.onSecondaryContainer),
		secondary_fixed: hexFromArgb(scheme.secondaryFixed),
		on_secondary_fixed: hexFromArgb(scheme.onSecondaryFixed),
		secondary_fixed_dim: hexFromArgb(scheme.secondaryFixedDim),
		on_secondary_fixed_variant: hexFromArgb(scheme.onSecondaryFixedVariant),
		tertiary: hexFromArgb(scheme.tertiary),
		on_tertiary: hexFromArgb(scheme.onTertiary),
		tertiary_container: hexFromArgb(scheme.tertiaryContainer),
		on_tertiary_container: hexFromArgb(scheme.onTertiaryContainer),
		tertiary_fixed: hexFromArgb(scheme.tertiaryFixed),
		on_tertiary_fixed: hexFromArgb(scheme.onTertiaryFixed),
		tertiary_fixed_dim: hexFromArgb(scheme.tertiaryFixedDim),
		on_tertiary_fixed_variant: hexFromArgb(scheme.onTertiaryFixedVariant),
		surface: hexFromArgb(scheme.surface),
		surface_container: hexFromArgb(scheme.surfaceContainer),
		surface_container_high: hexFromArgb(scheme.surfaceContainerHigh),
		surface_container_highest: hexFromArgb(scheme.surfaceContainerHighest),
		on_surface: hexFromArgb(scheme.onSurface),
		on_surface_variant: hexFromArgb(scheme.onSurfaceVariant),
		outline: hexFromArgb(scheme.outline),
		outline_variant: hexFromArgb(scheme.outlineVariant),
		scrim: hexFromArgb(scheme.scrim),
		error: hexFromArgb(scheme.error),
		on_error: hexFromArgb(scheme.onError),
		error_container: hexFromArgb(scheme.errorContainer),
		on_error_container: hexFromArgb(scheme.onErrorContainer),
	}

	if (candidateId === "fidelity") {
		// Fidelity: the primary container is the brand red itself (in both brightnesses). Its on-color uses the usual M3
		// container text tone (90 on dark, 10 on light containers) or whatever is needed to reach 7:1.
		const containerTone = source.tone
		const lighter = Contrast.lighter(containerTone, 7)
		const onContainerTone = lighter >= 0 ? Math.max(lighter, 90) : Math.min(Contrast.darker(containerTone, 7), 10)
		colors.primary_container = hexFromArgb(palettes.primary.tone(containerTone))
		colors.on_primary_container = hexFromArgb(palettes.primary.tone(onContainerTone))
	}

	return colors
}

/**
 * Assemble a complete {@link Theme} for a candidate theme id.
 * @param baseTheme built-in theme of the same brightness, provides the non-M3 roles.
 */
export async function generatePaletteCandidateTheme(themeId: ThemeId, baseTheme: Theme): Promise<Theme> {
	const parsed = parsePaletteCandidateThemeId(themeId)
	if (parsed == null) throw new Error(`not a palette candidate theme: ${themeId}`)
	const isDark = parsed.base === "dark"
	const colors = await generatePaletteCandidateColors(parsed.candidate.id, isDark)
	// state colors are based on outline_variant with alpha, like in the built-in themes
	const [hover, focus, active] = isDark ? ["77", "99", "AA"] : ["44", "55", "66"]
	return {
		...baseTheme,
		...colors,
		themeId,
		logo: getAppLogo(isDark ? colors.outline + "AA" : colors.outline_variant),
		state_bg_hover: colors.outline_variant + hover,
		state_bg_focus: colors.outline_variant + focus,
		state_bg_active: colors.outline_variant + active,
	}
}
