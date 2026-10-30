import m, { Children, Component, Vnode } from "mithril"
import type { ButtonAttrs } from "./Button.js"
import { Button } from "./Button.js"
import { MaybeLazy, resolveMaybeLazy } from "./MaybeLazy"
import { lang, MaybeTranslation } from "../utils/LanguageViewModel.js"

//If there is left/right Children it will override left/right
export type DialogHeaderBarAttrs = {
	left?: MaybeLazy<Array<ButtonAttrs>>
	leftChildren?: MaybeLazy<Children>
	right?: MaybeLazy<Array<ButtonAttrs>>
	rightChildren?: MaybeLazy<Children>
	middle?: MaybeTranslation
	create?: (dom: HTMLElement) => void
	remove?: () => void
	noHeader?: boolean
	class?: string
}

/**
 * An action bar is a bar that contains buttons (either on the left or on the right).
 */
export class DialogHeaderBar implements Component<DialogHeaderBarAttrs> {
	view(vnode: Vnode<DialogHeaderBarAttrs>): Children {
		const a = Object.assign(
			{},
			{
				left: [],
				right: [],
			},
			vnode.attrs,
		)
		let columnClass = a.middle ? ".flex-third" : ".flex-half"
		return m(
			".dialog-header.plr-24.flex-space-between.dialog-header-line-height",
			{
				oncreate: ({ dom }) => {
					if (a.create) a.create(dom as HTMLElement)
				},
				onremove: () => {
					if (a.remove) a.remove()
				},
				class: vnode.attrs.class,
			},
			[
				m(columnClass + ".ml-negative-8", a.leftChildren ? resolveMaybeLazy(a.leftChildren) : resolveMaybeLazy(a.left).map((a) => m(Button, a))), // ellipsis is not working if the text is directly in the flex element, so create a child div for it
				a.middle
					? m(
							// title-m keeps the centered title from truncating at phone width; keep the header bar line height
							"#dialog-title.flex-third-middle.overflow-hidden.flex.justify-center.items-center.title-m-emphasized",
							{
								"data-testid": `dialog:${lang.getTestId(a.middle)}`,
								style: { "line-height": "inherit" },
							},
							[m(".text-ellipsis", lang.getTranslationText(a.middle))],
						)
					: null,
				m(
					columnClass + ".mr-negative-8.flex.justify-end",
					a.rightChildren ? resolveMaybeLazy(a.rightChildren) : resolveMaybeLazy(a.right).map((a) => m(Button, a)),
				),
			],
		)
	}
}
