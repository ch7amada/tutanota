import m, { Children, Component, Vnode } from "mithril"
import { LoginController } from "../../api/main/LoginController.js"
import { BaseButton, BaseButtonAttrs } from "../../../../ui/base/buttons/BaseButton.js"
import { createDropdown } from "../../../../ui/base/Dropdown.js"
import { Icon, IconSize } from "../../../../ui/base/Icon.js"
import { Icons } from "../../../../ui/base/icons/Icons"
import { searchPillActionStyle } from "../../../../ui/base/SearchPill.js"
import { px, size } from "../../../../ui/size.js"
import { theme } from "../../../../ui/theme.js"
import { lang } from "../../../../ui/utils/LanguageViewModel.js"
import { LogoutUrl, SETTINGS_PREFIX } from "../../../../ui/utils/RouteChange"
import { getAccountInitial } from "./AccountInitial.js"

export interface AccountButtonAttrs {
	logins: LoginController
}

/**
 * Avatar with the initial of the logged-in user (as in Gmail's search bar). Opens a menu with the account address, settings and switch
 * account, the same entries the drawer offers.
 */
export class AccountButton implements Component<AccountButtonAttrs> {
	view({ attrs }: Vnode<AccountButtonAttrs>): Children {
		const { logins } = attrs
		const userController = logins.getUserController()
		const mailAddress = userController.userGroupInfo.mailAddress ?? userController.loginUsername
		const initial = getAccountInitial(userController.userGroupInfo.name, mailAddress)
		const avatarSize = px(size.icon_32)

		return m(BaseButton, {
			label: lang.makeTranslation("account_label", `${lang.get("account_label")}: ${mailAddress}`),
			icon: m(
				".flex.items-center.justify-center.border-radius-full.title-s-emphasized",
				{
					style: {
						width: avatarSize,
						height: avatarSize,
						"background-color": theme.primary_container,
						color: theme.on_primary_container,
					},
				},
				initial ||
					m(Icon, {
						icon: Icons.PersonFilled,
						size: IconSize.PX20,
						style: { fill: theme.on_primary_container },
					}),
			),
			iconWrapperSelector: "span.flex.items-center.justify-center",
			class: "state-bg border-radius-full flex items-center justify-center no-shrink",
			style: searchPillActionStyle,
			onclick: createDropdown({
				width: 300,
				lazyButtons: () => [
					{ info: mailAddress, center: false, bold: true },
					logins.isInternalUserLoggedIn()
						? {
								label: "settings_label",
								icon: Icons.GearWheelFilled,
								click: () => m.route.set(SETTINGS_PREFIX),
							}
						: null,
					{
						label: "switchAccount_action",
						icon: Icons.Logout,
						click: () => m.route.set(LogoutUrl),
					},
				],
			}),
		} satisfies BaseButtonAttrs)
	}
}
