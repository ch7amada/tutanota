import { EnvProvider } from "../platform-kit/app-env"
import { hexToRgb, isColorLight, isValidSolidColorCode, rgbToHex } from "./base/Color"

EnvProvider.assertMainOrNodeBoot()

/**
 * Unique identifier for a theme.
 * There are few built-in ones and there are whitelabel ones.
 * Whitelabel themes use domain name as an ID.
 */
export type ThemeId = "light" | "dark" | "light_secondary" | "dark_secondary" | string
export type BaseThemeId = "light" | "dark"
/**
 * This one is not attached to any single theme but is persisted and is shown to the user as a preference.
 */
export type ThemePreference = ThemeId | "auto:light|dark"
export type Theme = {
	themeId: ThemeId
	logo: string
	// Basic color tokens
	primary: string
	on_primary: string
	primary_container: string
	on_primary_container: string
	inverse_primary: string
	primary_fixed: string
	on_primary_fixed: string
	primary_fixed_dim: string
	on_primary_fixed_variant: string
	secondary: string
	on_secondary: string
	secondary_container: string
	on_secondary_container: string
	secondary_fixed: string
	on_secondary_fixed: string
	secondary_fixed_dim: string
	on_secondary_fixed_variant: string
	tertiary: string
	on_tertiary: string
	tertiary_container: string
	on_tertiary_container: string
	tertiary_fixed: string
	on_tertiary_fixed: string
	tertiary_fixed_dim: string
	on_tertiary_fixed_variant: string
	surface: string
	surface_dim: string
	surface_bright: string
	surface_container_lowest: string
	surface_container_low: string
	surface_container: string
	surface_container_high: string
	surface_container_highest: string
	on_surface: string
	on_surface_variant: string
	inverse_surface: string
	inverse_on_surface: string
	outline: string
	outline_variant: string
	shadow: string
	scrim: string
	// semantic colors
	error: string
	on_error: string
	error_container: string
	on_error_container: string
	warning: string
	on_warning: string
	warning_container: string
	on_warning_container: string
	success: string
	on_success: string
	success_container: string
	on_success_container: string
	// State colors; These are not the Material 3 color tokens. We are not following the M3 guideline to simplify state representations.
	state_bg_hover: string
	state_bg_focus: string
	state_bg_active: string
	// Campaign colors; These colors are ONLY for campaign use.
	content_bg_tuta_bday: string
	content_accent_tuta_bday: string
	content_accent_secondary_tuta_bday: string
	tuta_color_nota: string
	// SVG illustration colors. Do not use for UI.
	il_outline: string
	il_ne_outline: string
	il_highlight: string
	il_sign_up_flow_switch: string
	il_sign_up_flow_switch_2: string
	il_sign_up_flow_switch_4: string
	/**
	 * @deprecated Use not experimental color tokens instead.
	 */
	experimental_primary_container: string
	/**
	 * @deprecated Use not experimental color tokens instead.
	 */
	experimental_on_primary_container: string
	/**
	 * @deprecated Use not experimental color tokens instead.
	 */
	experimental_tertiary: string
	go_european: string
	on_go_european: string
	// Drive icon colors
	drive_folder: string
	drive_document: string
	drive_image: string
	drive_video: string
	drive_audio: string
}

const themeSingleton = {}

// ThemeController.updateTheme updates the object in place, so this will always be current.
// There are few alternative ways this could have been implemented:
//  * make each property on this singleton a getter that defers to themeController
//  * make this singleton a proxy that does the same thing
// We keep this singleton available because it is convenient to refer to, and already everywhere in the code before the addition of ThemeController.
export const theme = themeSingleton as Theme

export const themeOptions = (isCalendarApp: boolean) =>
	[
		{
			name: "systemThemePref_label",
			value: "auto:light|dark",
		},
		{
			name: "light_label",
			value: "light",
		},
		{
			name: "dark_label",
			value: "dark",
		},
		{
			name: isCalendarApp ? "light_red_label" : "light_blue_label",
			value: "light_secondary",
		},
		{
			name: isCalendarApp ? "dark_red_label" : "dark_blue_label",
			value: "dark_secondary",
		},
	] as const

export function getElevatedBackground(): string {
	return isColorLight(theme.surface) ? theme.surface : theme.surface_container
}

export function getNavigationMenuBg(): string {
	return isColorLight(theme.surface) ? theme.surface_container_high : theme.surface
}

/**
 * @return true if the current theme is a light theme
 */
export function isLightTheme(): boolean {
	return isColorLight(theme.surface)
}

/**
 * @return true if the current theme is a dark theme
 */
export function isDarkTheme(): boolean {
	return !isLightTheme()
}

export const MATERIAL_COLORS = Object.freeze([
	"primary",
	"on_primary",
	"primary_container",
	"on_primary_container",
	"inverse_primary",
	"secondary",
	"on_secondary",
	"secondary_container",
	"on_secondary_container",
	"tertiary",
	"on_tertiary",
	"tertiary_container",
	"on_tertiary_container",
	"surface",
	"surface_dim",
	"surface_bright",
	"surface_container_lowest",
	"surface_container_low",
	"surface_container",
	"surface_container_high",
	"surface_container_highest",
	"on_surface",
	"on_surface_variant",
	"inverse_surface",
	"inverse_on_surface",
	"outline",
	"outline_variant",
	"shadow",
	"scrim",
] as const satisfies (keyof Theme)[])

export type MaterialPalette = Record<(typeof MATERIAL_COLORS)[number], string>

/** Mix two solid hex colors in sRGB; {@param weight} is the share of {@param b}. */
function mixColors(a: string, b: string, weight: number): string {
	const ca = hexToRgb(a)
	const cb = hexToRgb(b)
	const mix = (x: number, y: number) => Math.round(x + (y - x) * weight)
	return rgbToHex({ r: mix(ca.r, cb.r), g: mix(ca.g, cb.g), b: mix(ca.b, cb.b) })
}

type DerivableColorRole =
	| "inverse_primary"
	| "surface_dim"
	| "surface_bright"
	| "surface_container_lowest"
	| "surface_container_low"
	| "inverse_surface"
	| "inverse_on_surface"
	| "shadow"

/**
 * M3 roles added to {@link Theme} after whitelabel and custom themes could already be saved, and how to approximate each of them
 * from roles every theme has. The approximations follow the M3 tone relations (e.g. surface_container_low sits between surface and
 * surface_container, inverse_surface has the tone of on_surface).
 */
const DERIVABLE_COLOR_ROLES: Record<DerivableColorRole, { from: ReadonlyArray<keyof Theme>; derive: (t: Theme, isLight: boolean) => string }> = {
	inverse_primary: { from: ["primary"], derive: (t, isLight) => mixColors(t.primary, isLight ? "#ffffff" : "#000000", 0.5) },
	surface_dim: {
		from: ["surface", "surface_container_highest", "on_surface"],
		derive: (t, isLight) => (isLight ? mixColors(t.surface_container_highest, t.on_surface, 0.05) : t.surface),
	},
	surface_bright: {
		from: ["surface", "surface_container_highest", "on_surface"],
		derive: (t, isLight) => (isLight ? t.surface : mixColors(t.surface_container_highest, t.on_surface, 0.05)),
	},
	surface_container_lowest: { from: ["surface"], derive: (t, isLight) => (isLight ? "#ffffff" : mixColors(t.surface, "#000000", 0.5)) },
	surface_container_low: { from: ["surface", "surface_container"], derive: (t) => mixColors(t.surface, t.surface_container, 0.5) },
	inverse_surface: { from: ["on_surface"], derive: (t) => t.on_surface },
	inverse_on_surface: { from: ["surface_container"], derive: (t) => t.surface_container },
	shadow: { from: [], derive: () => "#000000" },
}

/**
 * Fills in the color roles in {@link DERIVABLE_COLOR_ROLES} for themes that were defined without them (whitelabel customizations and
 * custom themes saved by older clients).
 *
 * A role is derived from the theme's own colors when {@param provided} (the colors that were actually customized) does not contain it
 * but does contain one of the roles it is derived from; otherwise the value already in {@param theme} (e.g. from the base theme) is kept.
 * Roles that cannot be derived because a source color is missing or invalid are left untouched.
 */
export function fillMissingColorRoles(theme: Theme, provided: Partial<Theme>): Theme {
	const result: Theme = { ...theme }
	if (!isValidSolidColorCode(theme.surface ?? "")) return result
	const isLight = isColorLight(theme.surface)
	for (const [role, { from, derive }] of Object.entries(DERIVABLE_COLOR_ROLES) as Array<
		[DerivableColorRole, (typeof DERIVABLE_COLOR_ROLES)[DerivableColorRole]]
	>) {
		if (provided[role] != null) continue
		const customizedSource = from.some((source) => provided[source] != null)
		if (theme[role] != null && !customizedSource) continue
		if (!from.every((source) => isValidSolidColorCode(theme[source] ?? ""))) continue
		result[role] = derive(theme, isLight)
	}
	return result
}

export interface BaseThemeProvider {
	getBaseTheme(baseId: BaseThemeId): Theme
}
