import m, { Children, Component, Vnode } from "mithril"
import { component_size, px } from "../size.js"
import { theme } from "../theme.js"
import { lang, MaybeTranslation } from "../utils/LanguageViewModel.js"
import { Icon, IconSize } from "./Icon.js"
import { Icons } from "./icons/Icons.js"

export interface SearchPillAttrs {
	/** Text shown in the pill. It is also the accessible name of the button that opens the search. */
	placeholder: MaybeTranslation
	/** Opens the search view. */
	onSearch: () => unknown
	/** Action at the start of the pill, usually the menu button. A search icon is shown when there is none. */
	leading?: Children
	/** Action at the end of the pill, usually the account entry. */
	trailing?: Children
}

/** Size for the actions inside the pill so that they get a 48px touch target. */
export const searchPillActionStyle: Record<string, string> = {
	width: px(component_size.button_height_md),
	height: px(component_size.button_height_md),
	"max-width": px(component_size.button_height_md),
	"max-height": px(component_size.button_height_md),
}

/**
 * The collapsed M3 search bar: a full pill with a leading action, a placeholder that opens the search when tapped and a trailing action.
 * Typing happens in the search view, the pill only leads there.
 */
export class SearchPill implements Component<SearchPillAttrs> {
	view({ attrs }: Vnode<SearchPillAttrs>): Children {
		return m(
			".flex.items-center.shape-search-bar.plr-4",
			{
				style: {
					height: px(component_size.search_bar_height),
					"background-color": theme.surface_container_high,
				},
			},
			[
				attrs.leading ??
					m(
						".flex.items-center.justify-center.no-shrink",
						{ style: searchPillActionStyle },
						m(Icon, {
							icon: Icons.Search,
							size: IconSize.PX24,
							style: { fill: theme.on_surface_variant },
						}),
					),
				m(
					"button.flex-grow.full-height.min-width-0.pl-4.body-l.text-ellipsis.border-radius-full",
					{
						type: "button",
						"data-testid": "btn:search_pill",
						style: { color: theme.on_surface_variant },
						onclick: () => attrs.onSearch(),
					},
					lang.getTranslationText(attrs.placeholder),
				),
				attrs.trailing ?? null,
			],
		)
	}
}
