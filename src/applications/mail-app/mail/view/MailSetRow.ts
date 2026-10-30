import m, { Children, Component, Vnode } from "mithril"
import type { NavButtonAttrs } from "../../../../ui/base/NavButton.js"
import { getDrawerItemColors, getDrawerItemHeight, isNavButtonSelected, NavButton } from "../../../../ui/base/NavButton.js"
import { theme } from "../../../../ui/theme"
import { px, size } from "../../../../ui/size"
import { IconButton, IconButtonAttrs } from "../../../../ui/base/IconButton.js"
import { Icon, IconAttrs } from "../../../../ui/base/Icon.js"
import { Icons } from "../../../../ui/base/icons/Icons.js"
import { lang } from "../../../../ui/utils/LanguageViewModel.js"
import { MailSet } from "@tutao/entities/tutanota"
import { ClientDetector } from "../../../../platform-kit/app-env/boot/ClientDetector"
import { contextDropdown } from "../../../../ui/base/GuiUtils"
import { DropdownButtonAttrs } from "../../../../ui/base/Dropdown"

export type MailSetRowAttrs = {
	count: number
	button: NavButtonAttrs
	rightButton?: IconButtonAttrs | null
	expanded: boolean | null
	indentationLevel: number
	onExpanderClick: (event: Event) => unknown
	mailSet: MailSet
	hasChildren: boolean
	onSelectedPath: boolean
	numberOfPreviousRows: number
	isLastSibling: boolean
	editMode: boolean
	onHover: () => void
	onDragEnter: () => void
	onDragLeave: () => void
	fullFolderPath: string
	getIconForMailSet: (mailSet: MailSet, button: NavButtonAttrs) => IconAttrs
	contextMenuButtonAttrs: DropdownButtonAttrs[]
}

export class MailSetRow implements Component<MailSetRowAttrs> {
	private hovered: boolean = false

	view(vnode: Vnode<MailSetRowAttrs>): Children {
		const { count, button, rightButton, expanded, indentationLevel, mailSet, hasChildren, editMode, onDragEnter, onDragLeave, getIconForMailSet } =
			vnode.attrs
		const iconAttrs = getIconForMailSet(mailSet, button)
		const onHover = () => {
			vnode.attrs.onHover()
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

		const indentationMargin = indentationLevel * size.spacing_12
		// M3 navigation drawer item: 16px before the icon, 12px between icon and label (the NavButton adds 8px itself)
		const paddingStart = size.spacing_16
		const paddingEnd = size.spacing_4
		const buttonWidth = paddingStart + size.icon_24 + paddingEnd
		const rowHeight = getDrawerItemHeight()
		const colors = getDrawerItemColors(isNavButtonSelected(button))

		return m(
			".folder-row.flex.flex-row.mlr-12.shape-navigation-drawer-item.state-bg",
			{
				style: {
					background: colors.background,
				},
				title: lang.getTranslationText(button.label),
				onmouseenter: onHover,
				onmouseleave: () => {
					this.hovered = false
				},
				oncontextmenu: (e: MouseEvent) => {
					contextDropdown(e, vnode.attrs.contextMenuButtonAttrs)
				},
			},
			[
				hasChildren && !expanded
					? m(Icon, {
							style: {
								position: "absolute",
								// bottom right corner of the folder icon
								bottom: px((rowHeight - size.icon_24) / 2 - 1),
								left: px(indentationMargin + paddingStart + size.icon_24 / 2 + 5),
								fill: colors.content,
							},
							icon: Icons.Plus,
							class: "icon-small",
						})
					: null,
				m("", {
					style: {
						marginLeft: px(indentationMargin),
					},
				}),
				this.renderHierarchyLine(vnode.attrs, indentationMargin, paddingStart, rowHeight),
				m(
					"button.flex.items-center.justify-end" + (editMode ? ".no-hover" : ""),
					{
						style: {
							left: px(indentationMargin),
							width: px(buttonWidth),
							height: px(rowHeight),
							paddingLeft: px(paddingStart),
							paddingRight: px(paddingEnd),
							// the zIndex is so the hierarchy lines never get drawn over the icon
							zIndex: 3,
						},
						"data-testid": `btn:icon:${vnode.attrs.fullFolderPath}`,
						"data-expanded": vnode.attrs.expanded ? "true" : "false",
						onclick: vnode.attrs.onExpanderClick,
						onkeydown: handleBackwardsTab,
					},
					m(Icon, iconAttrs),
				),
				m(NavButton, {
					...button,
					onfocus: onHover,
					onkeydown: handleBackwardsTab,
					dragEnterHandler: onDragEnter,
					dragLeaveHandler: onDragLeave,
					disableSelectedBackground: true,
				}),
				// show the edit button in either edit mode or on hover (excluding hover on mobile)
				rightButton && (editMode || (!ClientDetector.get().isMobileDevice() && this.hovered))
					? m(IconButton, {
							...rightButton,
							click: (event, dom) => {
								rightButton.click(event, dom)
							},
							onkeydown: handleForwardsTab,
						})
					: // M3 navigation drawer badge: plain label text at the end of the item
						count > 0
						? m(".label-l.pr-24", { style: { color: colors.content } }, count)
						: null,
			],
		)
	}

	private renderHierarchyLine(
		{ indentationLevel, numberOfPreviousRows, isLastSibling, onSelectedPath }: MailSetRowAttrs,
		indentationMargin: number,
		paddingStart: number,
		rowHeight: number,
	) {
		const lineSize = 1
		const border = `${lineSize}px solid ${theme.outline}`
		const verticalOffsetInsideRow = rowHeight / 2 + 1
		const verticalOffsetForParent = (rowHeight - size.icon_24) / 2
		const lengthOfHorizontalLine = size.spacing_12 - 2
		// the line starts below the parent's icon, which is indented by one level less
		const leftOffset = indentationMargin + paddingStart - size.spacing_8

		return indentationLevel !== 0
			? [
					isLastSibling || onSelectedPath
						? // draw both vertical and horizontal lines
							m(".abs", {
								style: {
									width: px(lengthOfHorizontalLine),
									borderBottomLeftRadius: "3px",
									// there's some subtle difference between border we use here and the top for the other element and this +1 is to
									// accommodate it
									height: px(1 + verticalOffsetInsideRow + verticalOffsetForParent + numberOfPreviousRows * rowHeight),
									top: px(-verticalOffsetForParent - numberOfPreviousRows * rowHeight),
									left: px(leftOffset),
									borderLeft: border,
									borderBottom: border,
									// we need to draw selected lines over everything else, even things that are drawn later
									zIndex: onSelectedPath ? 2 : 1,
								},
							})
						: // draw only the horizontal line
							m(".abs", {
								style: {
									height: px(lineSize),
									top: px(verticalOffsetInsideRow),
									left: px(leftOffset),
									width: px(lengthOfHorizontalLine),
									backgroundColor: theme.outline,
								},
							}),
				]
			: null
	}
}
