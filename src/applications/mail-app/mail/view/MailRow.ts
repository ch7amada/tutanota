import { FontIcons } from "../../../../ui/base/icons/FontIcons"
import { formatTimeOrDateOrYesterday } from "../../../../ui/utils/Formatter.js"
import m, { Children } from "mithril"
import Badge from "../../../../ui/base/Badge"
import { SelectableRowContainer, SelectableRowSelectedSetter, setVisibility } from "../../../../ui/SelectableRowContainer.js"
import { component_size, px, shape, size } from "../../../../ui/size.js"
import { setHTMLElementTextWithHighlighting, VirtualRow } from "../../../../ui/base/ListUtils.js"
import { companyTeamLabel } from "../../../../platform-kit/app-env/boot/ClientConstants.js"
import { getConfidentialFontIcon } from "./MailGuiUtils.js"
import { mailLocator } from "../../mailLocator.js"
import { getSenderOrRecipientHeading } from "./MailViewerUtils.js"
import { getLabelColor } from "../../../../ui/base/Label"
import { colorForBg } from "../../../../ui/base/GuiUtils"
import { theme } from "../../../../ui/theme"
import { SearchToken } from "../../../../ui/utils/QueryTokenUtils"
import { lang } from "../../../../ui/utils/LanguageViewModel"
import { getMailSetName } from "../model/MailUtils"
import { ClientDetector } from "../../../../platform-kit/app-env/boot/ClientDetector"
import { isTutaTeamMail } from "../../../common/mailFunctionality/SharedMailUtils"
import { isEditableDraft } from "../model/MailChecks"
import { Mail, MailSet } from "@tutao/entities/tutanota"
import { MailSetKind, MailState, ReplyType } from "../../../../entities/tutanota/Utils"
import { getMailFolderType } from "../MailUtils"
import { AvatarSender, renderSenderAvatar, SenderAvatarDom } from "../../../../ui/base/SenderAvatar.js"
import { isKeyPressed } from "../../../../ui/utils/KeyManager.js"
import { Keys } from "../../../../ui/utils/KeyboardKeys"

const iconMap: Record<MailSetKind, string> = {
	[MailSetKind.CUSTOM]: FontIcons.FolderFilled,
	[MailSetKind.INBOX]: FontIcons.InboxFilled,
	[MailSetKind.SENT]: FontIcons.SendFilled,
	[MailSetKind.TRASH]: FontIcons.TrashFilled,
	[MailSetKind.ARCHIVE]: FontIcons.ArchiveFilled,
	[MailSetKind.SPAM]: FontIcons.BugFilled,
	[MailSetKind.DRAFT]: FontIcons.DraftFilled,
	[MailSetKind.SCHEDULED]: FontIcons.ScheduleMail,
	// The ones below will never show a folder icon, but we need them to complete the set
	[MailSetKind.ALL]: FontIcons.FolderFilled,
	[MailSetKind.LABEL]: FontIcons.FolderFilled,
	[MailSetKind.IMPORTED]: FontIcons.FolderFilled,
}

/** Mail rows are a bit taller than other list rows to fit the avatar with some room (M3 two-line list item: 72px plus the gap between rows). */
export const MAIL_ROW_HEIGHT = component_size.list_row_height + size.spacing_8

/** The avatar doubles as the selection toggle, so it gets a full touch target around the 40px circle. */
const AVATAR_TOUCH_TARGET = size.core_48

const ELLIPSIS = "\u2026"

const MAX_DISPLAYED_LABELS = 6

export class MailRow implements VirtualRow<Mail> {
	top: number
	private domElement: HTMLElement | null = null

	entity: Mail | null = null
	private subjectDom!: HTMLElement
	private senderDom!: HTMLElement

	private dateDom!: HTMLElement
	private iconsDom!: HTMLElement
	private teamLabelDom!: HTMLElement
	private labelsDom: HTMLElement[] = []
	private moreLabelsIndicatorDom!: HTMLElement
	private avatarToggleDom!: HTMLElement
	private avatarDom!: SenderAvatarDom
	/** whether the row is checked in multiselect, shown as a check mark in the avatar */
	private checked = false
	private selectionSetter!: SelectableRowSelectedSetter

	private highlightedStrings?: readonly SearchToken[]

	constructor(
		private readonly showFolderIcon: boolean,
		private readonly getLabelsForMail: (mail: Mail) => ReadonlyArray<{ name: string; color: string | null }>,
		private readonly onSelected: (mail: Mail, selected: boolean) => unknown,
		private readonly getHighlightedStrings?: () => readonly SearchToken[],
	) {
		this.top = 0
		this.entity = null
	}

	update(mail: Mail, selected: boolean, isInMultiSelect: boolean): void {
		const oldEntity = this.entity
		this.entity = mail
		const oldHighlightedStrings = this.highlightedStrings
		this.highlightedStrings = this.getHighlightedStrings?.()

		this.selectionSetter(selected, isInMultiSelect)
		this.checked = isInMultiSelect && selected
		// only flip the avatar if the same mail was (de)selected, not when the row is reused for another mail while scrolling
		this.avatarDom.update(getAvatarSender(mail), this.checked, oldEntity === mail)
		this.avatarToggleDom.setAttribute("aria-checked", String(this.checked))
		const iconInformation = this.iconsText(mail)
		this.iconsDom.textContent = iconInformation.iconText
		const formattedDate = formatTimeOrDateOrYesterday(mail.receivedDate)
		this.dateDom.textContent = formattedDate

		const senderString = getSenderOrRecipientHeading(mail, true)
		// We need to set our sender/subject, but we should do this sparingly (i.e. when state actually changes)
		//
		// This requires assuming the following:
		// - `this.getHighlightedStrings()` will return the same array instance if the query hasn't changed
		// - `mail` will be a different instance if the entity was changed on the server
		if (oldEntity !== this.entity || oldHighlightedStrings !== this.highlightedStrings) {
			setHTMLElementTextWithHighlighting(this.senderDom, senderString, this.highlightedStrings)
			setHTMLElementTextWithHighlighting(this.subjectDom, mail.subject, this.highlightedStrings)
			this.avatarToggleDom.ariaLabel = senderString || getAvatarSender(mail).address
		}

		// unread mails are conveyed by bold sender, subject and date (and "unread" in the row description), read ones have a quieter subject and date
		for (const dom of [this.senderDom, this.subjectDom, this.dateDom]) {
			dom.classList.toggle("b", mail.unread)
		}
		for (const dom of [this.subjectDom, this.dateDom]) {
			dom.classList.toggle("text-fade", !mail.unread)
		}
		const labels = this.updateLabels(mail)

		const isTeamMail = isTutaTeamMail(mail)
		setVisibility(this.teamLabelDom, isTeamMail)

		if (this.domElement) {
			let labelsText = ""
			for (const label of labels) {
				labelsText += label.name + " "
			}
			const description = `${isTeamMail ? companyTeamLabel : ""} ${senderString} ${mail.subject} ${labelsText} ${formattedDate} ${mail.unread ? lang.get("unread_label") : ""} ${iconInformation.description} `
			this.domElement.ariaLabel = description
			// VoiceOver on iOS will read both aria-label and aria-description
			// and it NEEDS to have aria-label or it won't read it at all.
			// Some other readers e.g. TalkBack need aria-description instead
			// (at least if it's a child of <li>).
			if (!ClientDetector.get().isIos()) {
				// @ts-ignore
				this.domElement.ariaDescription = description
			}
		}
	}

	private updateLabels(mail: Mail): readonly { name: string; color: string | null }[] {
		const labels = this.getLabelsForMail(mail)

		for (const [i, element] of this.labelsDom.entries()) {
			const label = labels[i]
			if (label) {
				element.style.display = ""
				element.style.backgroundColor = getLabelColor(label.color)
				element.style.color = colorForBg(label.color ?? theme.primary)
				element.textContent = label.name
			} else {
				element.style.display = "none"
			}
		}
		this.moreLabelsIndicatorDom.style.display = labels.length > this.labelsDom.length ? "" : "none"
		return labels
	}

	/** Tapping the avatar toggles the selection like the checkbox it replaces (shift-click is left to the list for range selection). */
	private toggleSelection(): void {
		if (this.entity) this.onSelected(this.entity, !this.checked)
	}

	/**
	 * Only the structure is managed by mithril. We set all contents on our own (see update) in order to avoid the vdom overhead (not negligible on mobiles)
	 */
	render(): Children {
		return m(
			SelectableRowContainer,
			{
				class: "items-center pt-12 pb-12 pl-4 pr-16",
				onSelectedChangeRef: (changer) => {
					this.selectionSetter = changer
				},
				oncreate: (vnode) => {
					this.domElement = vnode.dom as HTMLElement
				},
			},
			[
				m(
					".flex.items-center.justify-center.no-shrink.state-bg.mr-8",
					{
						role: "checkbox",
						tabindex: "0",
						"aria-checked": "false",
						"data-testid": "list-row:mail:avatar",
						style: {
							width: px(AVATAR_TOUCH_TARGET),
							height: px(AVATAR_TOUCH_TARGET),
							borderRadius: px(shape.full),
						},
						onclick: (e: MouseEvent) => {
							// If the shift is pressed, let it bubble up and be handled by List which will do a range select
							if (!e.shiftKey) {
								e.stopPropagation()
								this.toggleSelection()
							}
						},
						onkeydown: (e: KeyboardEvent) => {
							if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
								// don't scroll and don't let the row (which selects on key up) or the global shortcuts handle it
								e.preventDefault()
								e.stopPropagation()
							}
						},
						onkeyup: (e: KeyboardEvent) => {
							if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
								e.stopPropagation()
								this.toggleSelection()
							}
						},
						oncreate: (vnode) => {
							this.avatarToggleDom = vnode.dom as HTMLElement
						},
					},
					renderSenderAvatar(undefined, (dom) => {
						this.avatarDom = new SenderAvatarDom(dom)
					}),
				),
				m(
					".flex-grow.min-width-0",
					{
						"aria-hidden": "true",
					},
					[
						m(".flex.badge-line-height", [
							m(
								Badge,
								{
									classes: ".small.mr-8",
									oncreate: (vnode) => (this.teamLabelDom = vnode.dom as HTMLElement),
								},
								companyTeamLabel,
							),
							m(".text-ellipsis", {
								oncreate: (vnode) => (this.senderDom = vnode.dom as HTMLElement),
							}),
							m(
								".flex.flex-grow-shrink-0.justify-end",
								{
									style: {
										minWidth: px(34), // so the moreLabelIndicator is visible on smaller screens
									},
								},
								this.renderLabels(),
								this.renderLabelsMoreIndicator(),
							),
							m("small.text-ellipsis.flex-fixed", {
								oncreate: (vnode) => (this.dateDom = vnode.dom as HTMLElement),
							}),
						]),
						m(".flex.mt-4", [
							m(".smaller.text-ellipsis", {
								"data-testid": "list-row:mail:subject",
								oncreate: (vnode) => (this.subjectDom = vnode.dom as HTMLElement),
							}),
							m(".flex-grow"),
							m("span.ion.ml-8.list-font-icons", {
								oncreate: (vnode) => (this.iconsDom = vnode.dom as HTMLElement),
							}),
						]),
					],
				),
			],
		)
	}

	private renderLabelsMoreIndicator(): Children {
		return m(
			"span.smaller.text-center.text-ellipsis.border-radius-8",
			{
				style: {
					// in dark theme override saturation to aid readability. This is not relative but absolute saturation. We preserve the hue.
					border: `2px solid ${getLabelColor(theme.on_surface_variant)}`,
					color: getLabelColor(theme.on_surface),
					padding: `0px ${size.spacing_4}px 1px`,
					marginRight: px(size.spacing_4),
					minWidth: px(16),
					lineHeight: px(8),
				},
				oncreate: (vnode) => {
					this.moreLabelsIndicatorDom = vnode.dom as HTMLElement
				},
			},
			ELLIPSIS,
		)
	}

	private renderLabels(): Children {
		return m(
			".flex.overflow-hidden",
			{
				style: {
					margin: `0 ${size.spacing_4}px`,
					columnGap: px(size.spacing_4),
					maxWidth: "fit-content",
				},
			},
			Array(MAX_DISPLAYED_LABELS)
				.fill(0)
				.map((_, i) =>
					// Not using the regular Label component as we have too
					// many differences and list is a special case anyway.
					m("span.small.text-center.text-ellipsis.border-radius-8", {
						"data-testid": "label",
						style: {
							padding: `2px ${size.spacing_4}px`,
							minWidth: "4ch",
							maxWidth: px(48),
							lineHeight: "100%",
							textOverflow: "'‥'",
						},
						oncreate: (vnode) => {
							this.labelsDom[i] = vnode.dom as HTMLElement
						},
					}),
				),
		)
	}

	private iconsText(mail: Mail): { iconText: string; description: string } {
		let iconText = ""
		let description = ""

		if (this.showFolderIcon) {
			let folder = mailLocator.mailModel.getMailFolderForMail(mail)
			if (folder) {
				iconText += this.folderIcon(getMailFolderType(folder))
				description += getMailSetName(folder) + " "
			}
		}

		if (mail._errors) {
			iconText += FontIcons.ExclamationFilled
			description += lang.get("corrupted_msg") + " "
		}

		if (isEditableDraft(mail)) {
			iconText += FontIcons.PenFilled
			description += lang.get("draft_label") + " "
		}

		switch (mail.replyType) {
			case ReplyType.REPLY:
				iconText += FontIcons.ArrowBackFilled
				description += lang.get("replied_label") + " "
				break

			case ReplyType.FORWARD:
				iconText += FontIcons.ArrowForwardFilled
				description += lang.get("forwarded_label") + " "
				break

			case ReplyType.REPLY_FORWARD:
				iconText += FontIcons.ArrowBackFilled
				iconText += FontIcons.ArrowForwardFilled
				description += lang.get("replied_label") + " "
				description += lang.get("forwarded_label") + " "
				break
		}

		if (mail.confidential) {
			iconText += getConfidentialFontIcon(mail)
			description += lang.get("confidential_label") + " "
		}

		if (mail.attachments.length > 0) {
			iconText += FontIcons.Paperclip
			description += lang.get("attachment_label")
		}

		return { iconText, description }
	}

	private folderIcon(type: MailSetKind): string {
		return iconMap[type] ?? FontIcons.FolderFilled
	}
}

/** The person the avatar stands for: the sender of received mails, otherwise the (first) recipient, matching {@link getSenderOrRecipientHeading}. */
function getAvatarSender(mail: Mail): AvatarSender {
	if (mail.state !== MailState.RECEIVED && mail.firstRecipient != null && parseInt(mail.recipientCount) > 0) {
		return mail.firstRecipient
	}
	return mail.sender
}
