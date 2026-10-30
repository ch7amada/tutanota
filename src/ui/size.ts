import { EnvProvider } from "../platform-kit/app-env"

EnvProvider.assertMainOrNodeBoot()
export const size = {
	/*
	 Base & core size
	 Use core sizes whenever it's possible.
	 It reduces the cognitive load on users, and enable developers to make better and faster decisions with fewer options.
	 Increments of 4 (base) are allowed for design flexibility, but try to use the core sizes first.
	 See also: https://www.figma.com/design/AGqWHYG9dYRMCFcW5sKWhp/Switch---Tuta-Design-System?node-id=19-4
	*/
	base_4: 4,
	core_8: 8,
	core_16: 16,
	core_24: 24,
	core_32: 32,
	core_40: 40,
	core_48: 48,
	core_56: 56,
	core_64: 64,
	core_72: 72,
	core_80: 80,
	core_96: 96,
	core_112: 112,
	core_128: 128,

	// Spacings
	get spacing_4(): number {
		return this.base_4
	},
	get spacing_8(): number {
		return this.core_8
	},
	get spacing_12(): number {
		return this.core_8 + this.base_4
	},
	get spacing_16(): number {
		return this.core_16
	},
	get spacing_24(): number {
		return this.core_24
	},
	get spacing_32(): number {
		return this.core_32
	},
	get spacing_48(): number {
		return this.core_48
	},
	get spacing_64(): number {
		return this.core_64
	},

	// Icons
	get icon_12(): number {
		return this.core_8 + this.base_4
	},
	get icon_16(): number {
		return this.core_16
	},
	get icon_20(): number {
		return this.core_16 + this.base_4
	},
	get icon_24(): number {
		return this.core_24
	},
	get icon_32(): number {
		return this.core_32
	},
	get icon_40(): number {
		return this.core_40
	},
	get icon_64(): number {
		return this.core_64
	},
	get icon_80(): number {
		return this.core_80
	},
	get icon_128(): number {
		return this.core_128
	},

	// Radii
	// The numeric steps of the Material 3 corner shape scale. Prefer the semantic names in `shape` (or the
	// component roles in `component_shape`) below; these numeric names stay for existing code.
	get radius_4(): number {
		return this.base_4
	},
	get radius_8(): number {
		return this.core_8
	},
	get radius_12(): number {
		return this.core_8 + this.base_4
	},
	get radius_16(): number {
		return this.core_16
	},
	get radius_20(): number {
		return this.core_16 + this.base_4
	},
	get radius_28(): number {
		return this.core_24 + this.base_4
	},
	get radius_32(): number {
		return this.core_32
	},
	get radius_48(): number {
		return this.core_48
	},
	/** Fully rounded: pill for rectangles, circle for squares. */
	radius_full: 9999,
}

/**
 * The central Material 3 (Expressive) corner shape scale. All corner radii in the UI should come from here.
 * See https://m3.material.io/styles/shape/corner-radius-scale
 */
export const shape = {
	none: 0,
	get extra_small(): number {
		return size.radius_4
	},
	get small(): number {
		return size.radius_8
	},
	get medium(): number {
		return size.radius_12
	},
	get large(): number {
		return size.radius_16
	},
	get large_increased(): number {
		return size.radius_20
	},
	get extra_large(): number {
		return size.radius_28
	},
	get extra_large_increased(): number {
		return size.radius_32
	},
	get extra_extra_large(): number {
		return size.radius_48
	},
	get full(): number {
		return size.radius_full
	},
}

/**
 * Which step of the shape scale each kind of component uses.
 */
export const component_shape = {
	/** All button variants (filled, outlined, text, icon, toggle, segmented) */
	get button(): number {
		return shape.full
	},
	/** Chips, bubbles, counter badges */
	get chip(): number {
		return shape.full
	},
	/** Floating action buttons (M3: large) */
	get fab(): number {
		return shape.large
	},
	get card(): number {
		return shape.extra_large
	},
	get dialog(): number {
		return shape.extra_large
	},
	get bottom_sheet(): number {
		return shape.extra_large
	},
	/** Menus, dropdowns and popovers */
	get menu(): number {
		return shape.large
	},
	get search_bar(): number {
		return shape.full
	},
	get text_field(): number {
		return shape.small
	},
	get snackbar(): number {
		return shape.small
	},
	get tooltip(): number {
		return shape.extra_small
	},
}

export const font_size = {
	base: 16,
	smaller: 14,
	small: 12,
	line_height: 1.428571429,
	line_height_m: 1.6,
	line_height_l: 1.8,

	get line_height_input(): number {
		return this.base + 8
	},
}

/**
 * One role of the type scale: font size and line height in px, the regular weight and the weight of the emphasized variant.
 */
export type TypeRole = {
	size: number
	lineHeight: number
	weight: number
	emphasizedWeight: number
}

export type TypeRoleName =
	| "display-l"
	| "display-m"
	| "display-s"
	| "headline-l"
	| "headline-m"
	| "headline-s"
	| "title-l"
	| "title-m"
	| "title-s"
	| "body-l"
	| "body-m"
	| "body-s"
	| "label-l"
	| "label-m"
	| "label-s"

/**
 * Material 3 (Expressive) type scale, rendered with the system font.
 * Body roles reuse the existing {@link font_size} sizes so body text is unchanged.
 * Emphasized variants are one weight step bolder: 500 for display/headline/body, 600 for title/label (the weight headers already used).
 * Each role is available as a CSS class (e.g. `.headline-m`) and an emphasized variant (e.g. `.headline-m-emphasized`).
 * h1-h6 map to headline-l..title-s emphasized (see main-styles).
 */
export const type_scale: Record<TypeRoleName, TypeRole> = {
	"display-l": { size: 57, lineHeight: 64, weight: 400, emphasizedWeight: 500 },
	"display-m": { size: 45, lineHeight: 52, weight: 400, emphasizedWeight: 500 },
	"display-s": { size: 36, lineHeight: 44, weight: 400, emphasizedWeight: 500 },
	"headline-l": { size: 32, lineHeight: 40, weight: 400, emphasizedWeight: 500 },
	"headline-m": { size: 28, lineHeight: 36, weight: 400, emphasizedWeight: 500 },
	"headline-s": { size: 24, lineHeight: 32, weight: 400, emphasizedWeight: 500 },
	"title-l": { size: 22, lineHeight: 28, weight: 400, emphasizedWeight: 600 },
	"title-m": { size: 16, lineHeight: 24, weight: 500, emphasizedWeight: 600 },
	"title-s": { size: 14, lineHeight: 20, weight: 500, emphasizedWeight: 600 },
	"body-l": { size: font_size.base, lineHeight: 24, weight: 400, emphasizedWeight: 500 },
	"body-m": { size: font_size.smaller, lineHeight: 20, weight: 400, emphasizedWeight: 500 },
	"body-s": { size: font_size.small, lineHeight: 16, weight: 400, emphasizedWeight: 500 },
	"label-l": { size: 14, lineHeight: 20, weight: 500, emphasizedWeight: 600 },
	"label-m": { size: 12, lineHeight: 16, weight: 500, emphasizedWeight: 600 },
	"label-s": { size: 11, lineHeight: 16, weight: 500, emphasizedWeight: 600 },
}

export const layout_size = {
	get calendar_line_height(): number {
		return font_size.small + 6
	},

	get calendar_hour_height(): number {
		return (this.calendar_line_height + 2 * this.calendar_event_border + this.calendar_day_event_padding) * 4
	},

	calendar_day_event_padding: 2,
	calendar_days_header_height: 25,
	calendar_event_border: 1,
	calendar_event_margin: 6,
	calendar_event_margin_mobile: 2,
	calendar_hour_width: 80,
	calendar_hour_width_mobile: 30,
	column_width_s_desktop: 135,
	column_width_s_mobile: 70,
	drawer_menu_width: 44,
	first_col_max_width: 300,
	first_col_min_width: 240,
	only_show_in_single_column_min_max_width: 10000, // viewport >= every mobile device viewport
	second_col_max_width: 350,
	second_col_min_width: 300,
	wizard_content_max_width: 600,
	wizard_progress_width: 260,
	wizard_show_illustration_min_width: 1500,
	wizard_max_width: 1800,
	wizard_max_height: 1200,
	third_col_max_width: 2400,
	third_col_min_width: 600,

	get desktop_layout_width(): number {
		return this.first_col_min_width + this.second_col_min_width + this.third_col_min_width
	},

	get two_column_layout_width(): number {
		return this.second_col_min_width + this.third_col_min_width
	},

	column_resize_element_width: 5,
}

export const component_size = {
	button_height: 44,
	button_height_sm: 32,
	button_height_md: 48,
	button_height_lg: 56,
	button_height_accent: 40,
	button_height_bubble: 30,
	button_height_compact: 30,
	button_icon_bg_size: 32,
	button_floating_size: 56,
	icon_segment_control_button_height: 36,
	icon_segment_control_button_width: 48,

	navbar_height: 72,
	navbar_height_mobile: 52,
	/** M3 search bar */
	search_bar_height: 56,
	bottom_nav_bar: 50,
	navbar_button_width: 80,
	navbar_edge_width_mobile: 58,
	header_logo_height: 36,
	list_row_height: 68,
	dot_size: 7,
	checkbox_size: 14,
	checkbox_border_size: 2,
	get checkbox_helper_text_margin(): number {
		return this.checkbox_size + this.checkbox_border_size + size.spacing_4
	},
}

export function px(value: number): string {
	return value + "px"
}
