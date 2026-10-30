import m, { Children, Component, Vnode } from "mithril"
import { IconButton } from "./IconButton.js"
import { Icons } from "./icons/Icons.js"
import { ButtonColor } from "./Button.js"
import type { MaybeTranslation } from "../utils/LanguageViewModel.js"
import { ButtonSize } from "./ButtonSize.js"
import { ClickHandler } from "./GuiUtils"
import { component_size, px, size } from "../size"
import { BaseButton } from "./buttons/BaseButton.js"
import { Icon, IconSize } from "./Icon.js"
import { lang } from "../utils/LanguageViewModel.js"
import { theme } from "../theme.js"
import { springTransition } from "../animation/Motion.js"

export type FloatingActionButtonAttrs = {
	title: MaybeTranslation
	colors: ButtonColor
	icon: Icons
	click: ClickHandler
	/** visible label, turns this into an extended FAB (icon + label) */
	text?: MaybeTranslation
	/** extended FAB only: show the icon alone. {@link title} stays the accessible name. */
	collapsed?: boolean
}

export class FloatingActionButton implements Component<FloatingActionButtonAttrs> {
	oncreate() {
		onFabShown(DisplayState.Shown)
		// need additional redraw to adjust position of other components
		m.redraw()
	}
	onremove() {
		onFabShown(DisplayState.Hidden)
		// need additional redraw to adjust position of other components
		m.redraw()
	}
	view({ attrs: { title, colors, icon, click, text, collapsed }, children }: Vnode<FloatingActionButtonAttrs>): Children {
		if (text != null) {
			return m("fab.fab-position.z4", this.renderExtended(title, icon, click, text, collapsed ?? false), children)
		}
		return m(
			"fab.fab-position.accent-bg.fab-shadow.z4.shape-fab",
			m(IconButton, {
				colors,
				icon,
				label: title,
				click: click,
				size: ButtonSize.Large,
			}),
			children,
		)
	}

	/** M3 Expressive extended FAB: 56dp tall, 16dp corners, primary container; the label folds away with the spring when collapsed. */
	private renderExtended(title: MaybeTranslation, icon: Icons, click: ClickHandler, text: MaybeTranslation, collapsed: boolean): Children {
		return m(BaseButton, {
			label: title,
			icon: m(Icon, { icon, size: IconSize.PX24, style: { fill: theme.on_primary_container } }),
			iconWrapperSelector: "span.flex",
			text: m(
				"span.text-ellipsis",
				{
					style: {
						maxWidth: collapsed ? "0" : px(200),
						marginLeft: collapsed ? "0" : px(size.spacing_12),
						opacity: collapsed ? "0" : "1",
						whiteSpace: "nowrap",
						transition: springTransition("default_spatial", "max-width", "margin-left", "opacity"),
					},
				},
				lang.getTranslationText(text),
			),
			onclick: click,
			class: "flex items-center fab-shadow shape-fab state-bg b",
			style: {
				height: px(component_size.button_floating_size),
				minWidth: px(component_size.button_floating_size),
				padding: `0 ${px(size.spacing_16)}`,
				boxSizing: "border-box",
				backgroundColor: theme.primary_container,
				color: theme.on_primary_container,
			},
		})
	}
}

/** Scroll distance (px) that has to accumulate before the extended FAB changes state, so small jitters do not toggle it. */
const FAB_SCROLL_THRESHOLD = 8

/**
 * Extended FABs collapse to their icon while the user scrolls down and expand again on scroll up or at the top of the list.
 * Movements are measured from the last position where the direction was decided, so slow scrolling (many small events) still counts.
 */
export class FabScrollState {
	collapsed: boolean = false
	private anchor: number = 0

	/** @return true if {@link collapsed} changed */
	onScroll(scrollTop: number): boolean {
		const wasCollapsed = this.collapsed
		const delta = scrollTop - this.anchor
		if (scrollTop <= 0) {
			this.collapsed = false
			this.anchor = 0
		} else if (Math.abs(delta) > FAB_SCROLL_THRESHOLD) {
			this.collapsed = delta > 0
			this.anchor = scrollTop
		}
		return wasCollapsed !== this.collapsed
	}

	reset() {
		this.collapsed = false
		this.anchor = 0
	}
}

export const enum DisplayState {
	Shown,
	Hidden,
}

let fabDisplayState: DisplayState = DisplayState.Hidden
export function onFabShown(state: DisplayState) {
	fabDisplayState = state
}

export function isFabShown(): boolean {
	return fabDisplayState === DisplayState.Shown
}

export function fabBottomSpacing(): number {
	if (fabDisplayState === DisplayState.Shown) {
		return component_size.button_floating_size - size.spacing_24
	} else {
		return 0
	}
}
