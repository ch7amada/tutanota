import m, { Children, Component, Vnode } from "mithril"
import { createDropdown, Dropdown, DROPDOWN_MARGIN, DropdownButtonAttrs } from "../../../../ui/base/Dropdown.js"
import { Icons } from "../../../../ui/base/icons/Icons.js"
import { LabelsPopupOpts, ShowMoveMailsDropdownOpts } from "./MailGuiUtils.js"
import { modal } from "../../../../ui/base/Modal.js"
import type { MailViewerMoreActions } from "./MailViewerUtils.js"
import { multipleMailViewerMoreActions } from "./MailViewerUtils.js"
import { FloatingToolbar, FloatingToolbarAction } from "../../../../ui/FloatingToolbar.js"

import { PosRect } from "../../../../ui/utils/PosRect"

export interface MobileMailActionBarAttrs {
	deleteMailsAction: (() => void) | null
	trashMailsAction: (() => void) | null
	moveMailsAction: ((origin: PosRect, opts?: ShowMoveMailsDropdownOpts) => void) | null
	applyLabelsAction: ((dom: HTMLElement, opts: LabelsPopupOpts) => void) | null
	setUnreadStateAction: ((unread: boolean) => void) | null
	isUnread: boolean | null
	editDraftAction: (() => void) | null
	replyAction: (() => void) | null
	replyAllAction: (() => void) | null
	forwardAction: (() => void) | null
	mailViewerMoreActions: MailViewerMoreActions | null
	unscheduleMailAction: (() => void) | null
	reportNotSpamAction: (() => void) | null
}

export class MobileMailActionBar implements Component<MobileMailActionBarAttrs> {
	private dom: HTMLElement | null = null

	view(vnode: Vnode<MobileMailActionBarAttrs>): Children {
		const { attrs } = vnode

		const reportNotSpamButton = this.reportNotSpamButton(attrs)
		return m(FloatingToolbar, {
			oncreate: (vnode) => {
				this.dom = vnode.dom as HTMLElement
			},
			actions: [
				reportNotSpamButton ?? this.unscheduleButton(attrs) ?? this.editButton(attrs) ?? this.replyButton(attrs),
				reportNotSpamButton ? null : this.forwardButton(attrs),
				this.deleteButton(attrs) ?? this.trashButton(attrs),
				this.moveButton(attrs),
				this.moreButton(attrs),
			],
		})
	}

	private reportNotSpamButton({ reportNotSpamAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			reportNotSpamAction && {
				label: "reportNotSpam_action",
				click: reportNotSpamAction,
				icon: Icons.BugCrossedFilled,
			}
		)
	}

	private moveButton({ moveMailsAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			moveMailsAction && {
				label: "move_action",
				click: (e, dom) =>
					moveMailsAction(dom.getBoundingClientRect(), {
						width: this.dropdownWidth(),
						withBackground: true,
					}),
				icon: Icons.FolderFilled,
			}
		)
	}

	private dropdownWidth() {
		// the floating toolbar only hugs its buttons, menus keep the width of the view like with the former full-width bar
		const viewWidth = (this.dom?.offsetParent as HTMLElement | null)?.offsetWidth
		return viewWidth ? viewWidth - DROPDOWN_MARGIN * 2 : undefined
	}

	private moreButton({
		applyLabelsAction,
		setUnreadStateAction,
		isUnread,
		mailViewerMoreActions,
		reportNotSpamAction,
	}: MobileMailActionBarAttrs): FloatingToolbarAction {
		return {
			label: "more_label",
			click: createDropdown({
				lazyButtons: () => {
					const moreButtons: DropdownButtonAttrs[] = []
					if (applyLabelsAction) {
						moreButtons.push({
							label: "assignLabel_action",
							click: (_, dom) => {
								const referenceDom = this.dom ?? dom
								applyLabelsAction(referenceDom, {
									width: this.dropdownWidth(),
									origin: referenceDom.getBoundingClientRect(),
								})
							},
							icon: Icons.LabelFilled,
						})
					}
					if (setUnreadStateAction != null) {
						const readButton: DropdownButtonAttrs = {
							label: "markRead_action",
							click: () => setUnreadStateAction(false),
							icon: Icons.EyeFilled,
						}
						const unreadButton: DropdownButtonAttrs = {
							label: "markUnread_action",
							click: () => setUnreadStateAction(true),
							icon: Icons.EyeCrossedFilled,
						}

						// isUnread means we are viewing one mail; otherwise, it is coming from a MultiViewer
						if (isUnread != null) {
							if (isUnread) {
								moreButtons.push(readButton)
							} else {
								moreButtons.push(unreadButton)
							}
						} else {
							moreButtons.push(readButton, unreadButton)
						}
					}

					return [...moreButtons, ...multipleMailViewerMoreActions(mailViewerMoreActions)]
				},
				width: this.dropdownWidth(),
				withBackground: true,
			}),
			icon: Icons.More,
		}
	}

	private deleteButton({ deleteMailsAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			deleteMailsAction && {
				label: "delete_action",
				click: deleteMailsAction,
				icon: Icons.TrashCrossFilled,
			}
		)
	}

	private trashButton({ trashMailsAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			trashMailsAction && {
				label: "trash_action",
				click: trashMailsAction,
				icon: Icons.TrashFilled,
			}
		)
	}

	private forwardButton({ forwardAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			forwardAction && {
				label: "forward_action",
				click: forwardAction,
				icon: Icons.ArrowForwardFilled,
			}
		)
	}

	private replyButton({ replyAction, replyAllAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			replyAction && {
				label: "reply_action",
				click:
					replyAllAction != null
						? (e, dom) => {
								const dropdown = new Dropdown(
									() => [
										{
											label: "replyAll_action",
											icon: Icons.DoubleArrowBackFilled,
											click: replyAllAction,
										},
										{
											label: "reply_action",
											icon: Icons.ArrowBackFilled,
											click: replyAction,
										},
									],
									this.dropdownWidth() ?? 300,
								)

								const domRect = this.dom?.getBoundingClientRect() ?? dom.getBoundingClientRect()
								dropdown.setOrigin(domRect)
								modal.displayUnique(dropdown, true)
							}
						: replyAction,
				icon: replyAllAction != null ? Icons.DoubleArrowBackFilled : Icons.ArrowBackFilled,
			}
		)
	}

	private editButton({ editDraftAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			editDraftAction && {
				label: "edit_action",
				icon: Icons.PenFilled,
				click: editDraftAction,
			}
		)
	}

	private unscheduleButton({ unscheduleMailAction }: MobileMailActionBarAttrs): FloatingToolbarAction | null {
		return (
			unscheduleMailAction && {
				label: "cancelSend_action",
				icon: Icons.X,
				click: unscheduleMailAction,
			}
		)
	}
}
