import m, { Children, Component, Vnode } from "mithril"
import { AppHeaderAttrs } from "../../../../ui/Header.js"
import { MobileHeaderMenuButton } from "../../../../ui/MobileHeader.js"
import { OfflineIndicator } from "../../../../ui/base/OfflineIndicator.js"
import { ProgressBar } from "../../../../ui/base/ProgressBar.js"
import { SearchPill, searchPillActionStyle } from "../../../../ui/base/SearchPill.js"
import { component_size, px, size } from "../../../../ui/size.js"
import { Styles } from "../../../../ui/styles.js"
import { theme } from "../../../../ui/theme.js"
import { lang, MaybeTranslation } from "../../../../ui/utils/LanguageViewModel.js"
import { SEARCH_PREFIX } from "../../../../ui/utils/RouteChange"
import { AccountButton } from "../../../common/gui/nav/AccountButton.js"
import { locator } from "../../../common/api/main/CommonLocator.js"

export interface MailListMobileHeaderAttrs extends AppHeaderAttrs {
	/** Name of the folder, shown below the search pill. */
	title: MaybeTranslation
	/** List actions (filter, multiselect), shown next to the folder name. Hidden while selecting. */
	actions: Children
	/** Shown after the actions in single column layout, like {@link MobileHeader} does. */
	primaryAction: () => Children
	/** Opens the folder drawer. */
	backAction: () => unknown
	/** Header for the multiselect state. While set it replaces the search pill, keeping its height so that the list doesn't move. */
	selectionHeader?: Children
}

/** Height of the row with the search pill: the pill plus 8px above and below. */
const searchRowHeight = component_size.search_bar_height + 2 * size.spacing_8

/**
 * Mobile header of the mail list, as in Gmail: a search pill (menu, "Search emails", account) that opens the search view, and below it the
 * folder name with the list actions.
 */
export class MailListMobileHeader implements Component<MailListMobileHeaderAttrs> {
	view({ attrs }: Vnode<MailListMobileHeaderAttrs>): Children {
		const selecting = attrs.selectionHeader != null
		// the multiselect header brings its own safe area margin
		return m(".flex.col.rel.noprint", { class: selecting ? "" : "mt-safe-inset" }, [
			selecting
				? m(
						"",
						{
							style: {
								"padding-top": px((searchRowHeight - component_size.navbar_height_mobile) / 2),
								"padding-bottom": px((searchRowHeight - component_size.navbar_height_mobile) / 2),
							},
						},
						attrs.selectionHeader,
					)
				: m(
						".plr-safe-inset",
						m(
							".plr-16.pt-8.pb-8",
							m(SearchPill, {
								placeholder: "searchEmails_placeholder",
								onSearch: () => m.route.set(`${SEARCH_PREFIX}/mail`),
								leading: Styles.get().isMobileDesktopLayout()
									? // the folder column is always visible here, there is no drawer to open
										null
									: m(MobileHeaderMenuButton, { ...attrs, style: searchPillActionStyle }),
								trailing: m(AccountButton, { logins: locator.logins }),
							}),
						),
					),
			m(
				".flex.items-center.plr-safe-inset",
				{
					style: {
						"min-height": px(component_size.button_height_md),
					},
				},
				[
					m(".flex-grow.flex.col.items-start.min-width-0.pl-16", [
						m(
							".title-s-emphasized.text-ellipsis.align-self-stretch",
							{ style: { color: theme.on_surface_variant } },
							lang.getTranslationText(attrs.title),
						),
						m(OfflineIndicator, attrs.offlineIndicatorModel.getCurrentAttrs()),
					]),
					selecting ? null : [attrs.actions, Styles.get().isSingleColumnLayout() ? attrs.primaryAction() : null],
				],
			),
			selecting ? null : m(ProgressBar, { progress: attrs.offlineIndicatorModel.getProgress() }),
		])
	}
}
