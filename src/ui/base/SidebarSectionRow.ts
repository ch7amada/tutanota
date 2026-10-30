import m, { Children, Component, Vnode } from "mithril"
import { AllIcons, Icon, IconSize } from "./Icon"
import { getDrawerItemColors, isNavButtonSelected, NavButton, NavButtonAttrs, NavButtonColor } from "./NavButton"
import { ClickHandler, contextDropdown, DropData } from "./GuiUtils"
import type { MaybeTranslation } from "../utils/LanguageViewModel"
import { assertNotNull } from "../../platform-kit/utils"
import { ClientDetector } from "../../platform-kit/app-env/boot/ClientDetector"
import { IconButton, IconButtonAttrs } from "./IconButton"
import { DropdownButtonAttrs } from "./Dropdown"

export interface SidebarSectionRowAttrs {
	icon: AllIcons
	label: MaybeTranslation
	path: string
	onClick: ClickHandler
	moreButton: IconButtonAttrs
	iconColor?: string
	alwaysShowMoreButton?: boolean
	isSelectedPrefix?: string | boolean
	disabled?: boolean
	dropHandler?: (dropData: DropData) => unknown
	contextMenuAttrs?: DropdownButtonAttrs[]
}

/**
 * Selectable navigation row, typically used in the sidebar, like contact list or labels.
 */
export class SidebarSectionRow implements Component<SidebarSectionRowAttrs> {
	private hovered: boolean = false

	view({ attrs }: Vnode<SidebarSectionRowAttrs>): Children {
		const onHover = () => {
			this.hovered = true
		}

		// because onblur is fired upon changing folder due to the route change
		// these functions can be used to handle keyboard navigation
		const handleForwardsTab = (event: KeyboardEvent) => {
			if (event.key === "Tab" && !event.shiftKey) {
				this.hovered = false
			}
		}
		const handleBackwardsTab = (event: KeyboardEvent) => {
			if (event.key === "Tab" && event.shiftKey) this.hovered = false
		}

		const navButtonAttrs: NavButtonAttrs = {
			label: attrs.label,
			href: () => attrs.path,
			colors: NavButtonColor.Nav,
			disableHoverBackground: true,
			disableSelectedBackground: true,
			click: attrs.onClick,
			onfocus: onHover,
			onkeydown: handleBackwardsTab,
			isSelectedPrefix: attrs.isSelectedPrefix,
			disabled: attrs.disabled,
			dropHandler: attrs.dropHandler ? (dropData) => assertNotNull(attrs.dropHandler)(dropData) : undefined,
		}

		const colors = getDrawerItemColors(isNavButtonSelected(navButtonAttrs))
		return m(
			".folder-row.flex.flex-row.mlr-12.shape-navigation-drawer-item.state-bg",
			{
				style: { background: colors.background },
				onmouseenter: onHover,
				onmouseleave: () => {
					this.hovered = false
				},
				oncontextmenu: (e: MouseEvent) => {
					if (attrs.contextMenuAttrs) {
						contextDropdown(e, attrs.contextMenuAttrs)
					}
				},
			},
			[
				// we render icon on our own to be able to override the color and to control the padding
				m(
					".flex.items-center.pl-16.pr-4",
					m(Icon, {
						icon: attrs.icon,
						size: IconSize.PX24,
						style: {
							fill: attrs.iconColor ?? colors.content,
						},
					}),
				),
				m(NavButton, navButtonAttrs),
				attrs.alwaysShowMoreButton || (!ClientDetector.get().isMobileDevice() && this.hovered)
					? m(IconButton, {
							...attrs.moreButton,
							click: (event, dom) => {
								attrs.moreButton.click(event, dom)
							},
							onkeydown: handleForwardsTab,
						})
					: null,
			],
		)
	}
}
