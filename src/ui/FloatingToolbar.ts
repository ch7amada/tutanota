import m, { Children, Component, Vnode } from "mithril"
import { IconButton, IconButtonAttrs } from "./base/IconButton.js"
import { ButtonColor } from "./base/Button.js"
import { component_size, size } from "./size.js"
import { getSafeAreaInsetBottom } from "./HtmlUtils.js"

/** An icon button in the toolbar; colors and size come from the toolbar. */
export type FloatingToolbarAction = Omit<IconButtonAttrs, "colors" | "size">

export interface FloatingToolbarAttrs {
	/** Icon buttons in display order, null entries are skipped. Extras belong behind a trailing overflow ("more") button. */
	actions: ReadonlyArray<FloatingToolbarAction | null>
}

let shownToolbars = 0

/**
 * Material 3 Expressive floating toolbar (horizontal, vibrant colors): an elevated pill that floats centered above the content near the bottom
 * edge. Used instead of the bottom navigation for the actions of what is shown on mobile.
 *
 * It does not take up any layout space: scrolling content behind it must leave {@link floatingToolbarClearance} free at its end.
 */
export class FloatingToolbar implements Component<FloatingToolbarAttrs> {
	oncreate() {
		shownToolbars++
	}

	onremove() {
		shownToolbars--
	}

	view({ attrs }: Vnode<FloatingToolbarAttrs>): Children {
		return m(
			".floating-toolbar.flex.items-center.noprint",
			{ role: "toolbar" },
			attrs.actions.map((action) => action && m(IconButton, { ...action, colors: ButtonColor.FloatingToolbar })),
		)
	}
}

/** Height a floating toolbar covers at the bottom of the view: the toolbar, its margin and the safe-area inset. */
export function floatingToolbarClearance(): number {
	return component_size.floating_toolbar_height + size.spacing_16 + getSafeAreaInsetBottom()
}

/** {@link floatingToolbarClearance} while a floating toolbar is shown, otherwise 0. */
export function shownFloatingToolbarClearance(): number {
	return shownToolbars > 0 ? floatingToolbarClearance() : 0
}
