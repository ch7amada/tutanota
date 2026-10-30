import m, { Children, Component, Vnode, VnodeDOM } from "mithril"
import { isSelectedPrefix } from "../../../ui/base/NavButton.js"
import { CALENDAR_PREFIX, CONTACTS_PREFIX, DRIVE_PREFIX, MAIL_PREFIX, throttleRoute } from "../../../ui/utils/RouteChange"
import { FeatureType } from "../../../platform-kit/app-env"
import { locator } from "../../common/api/main/CommonLocator.js"
import { isDriveEnabled } from "../../common/misc/DriveUtils"
import { Icons } from "../../../ui/base/icons/Icons"
import { AllIcons, Icon } from "../../../ui/base/Icon"
import { theme } from "../../../ui/theme"
import { lang, TranslationKey } from "../../../ui/utils/LanguageViewModel"
import { springTransition } from "../../../ui/animation/Motion"

type Attrs = void

type BottomNavItem = {
	label: TranslationKey
	icon: AllIcons
	href: string
}

/**
 * Index of the active item when the bar was last rendered. Every view renders its own bar, so this lets the
 * indicator of a newly created bar start where the previous one was and slide to the new item.
 */
let lastSelectedIndex: number | null = null

/**
 * M3 Expressive (flexible, short) navigation bar: icon + label items with a pill indicator behind the active icon
 * that slides between items. Search is not part of it, it is reached through the search pill in the mail list.
 */
export class BottomNav implements Component<Attrs> {
	private readonly routeTo = throttleRoute()

	view(vnode: Vnode<Attrs>): Children {
		const items = getBottomNavItems()
		const selectedIndex = items.findIndex((item) => isSelectedPrefix(item.href))
		const previousIndex = lastSelectedIndex
		lastSelectedIndex = selectedIndex === -1 ? lastSelectedIndex : selectedIndex

		// Using bottom-nav class too to match it inside media queries like @print, otherwise it's not matched
		return m("nav.bottom-nav.bottom-nav-bar.flex.rel", [
			m(
				".bottom-nav-indicator.abs.flex.justify-center",
				{
					"aria-hidden": "true",
					style: {
						width: `${100 / Math.max(items.length, 1)}%`,
						opacity: selectedIndex === -1 ? "0" : "1",
						transform: indicatorTransform(selectedIndex === -1 ? (previousIndex ?? 0) : selectedIndex),
						transition: springTransition("default_spatial", "transform"),
					},
					oncreate: ({ dom }: VnodeDOM) => {
						// slide in from the previous view's position
						if (previousIndex == null || selectedIndex === -1 || previousIndex === selectedIndex) return
						const el = dom as HTMLElement
						const target = el.style.transform
						el.style.transition = "none"
						el.style.transform = indicatorTransform(previousIndex)
						el.getBoundingClientRect()
						el.style.transition = springTransition("default_spatial", "transform")
						el.style.transform = target
					},
				},
				m(".bottom-nav-indicator-pill"),
			),
			items.map((item, index) => this.renderItem(item, index === selectedIndex)),
		])
	}

	private renderItem(item: BottomNavItem, selected: boolean): Children {
		const label = lang.get(item.label)
		return m(
			m.route.Link,
			{
				href: item.href,
				selector: "a.bottom-nav-item.flex-grow.col.items-center.click.no-text-decoration.noselect",
				"aria-current": selected ? "page" : undefined,
				title: label,
				"data-testid": `btn:${lang.getTestId(item.label)}`,
				style: { color: selected ? theme.secondary : theme.on_surface_variant },
				onclick: (e: MouseEvent) => {
					// the throttled route avoids stacking up views when tapping quickly
					e.preventDefault()
					this.routeTo(item.href, {})
				},
			},
			[
				m(
					".bottom-nav-item-icon.flex.items-center.justify-center",
					m(Icon, {
						icon: item.icon,
						class: "icon-24",
						style: { fill: selected ? theme.on_secondary_container : theme.on_surface_variant },
					}),
				),
				m("span.label-m.text-ellipsis", label),
			],
		)
	}
}

function indicatorTransform(index: number): string {
	return `translateX(${index * 100}%)`
}

function getBottomNavItems(): BottomNavItem[] {
	const logins = locator.logins
	const internal = logins.isInternalUserLoggedIn()
	const items: BottomNavItem[] = [{ label: "emails_label", icon: Icons.MailFilled, href: MAIL_PREFIX }]
	if (internal && !logins.isEnabled(FeatureType.DisableContacts)) {
		items.push({ label: "contacts_label", icon: Icons.PeopleFilled, href: CONTACTS_PREFIX })
	}
	if (internal && !logins.isEnabled(FeatureType.DisableCalendar)) {
		items.push({ label: "calendar_label", icon: Icons.CalendarFilled, href: CALENDAR_PREFIX })
	}
	if (isDriveEnabled(logins)) {
		items.push({ label: "driveView_action", icon: Icons.DriveFilled, href: DRIVE_PREFIX })
	}
	return items
}
