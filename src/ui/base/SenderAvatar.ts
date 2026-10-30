import m, { ClassComponent, Vnode, VnodeDOM } from "mithril"
import { isLightTheme, theme } from "../theme.js"
import { px, shape, type_scale } from "../size.js"
import { Icon, IconSize } from "./Icon.js"
import { Icons } from "./icons/Icons.js"

export interface AvatarColors {
	background: string
	foreground: string
}

/**
 * Colours for the sender avatars: one Material 3 tonal palette per hue (hues spread around the colour wheel, chroma 40).
 * Light themes use the container tones (tone 90 background, tone 10 initial), dark themes tone 30 with a tone 90 initial,
 * like M3 primary/secondary containers, so the initial has far more than 4.5:1 contrast in both.
 *
 * The values are baked so that nothing is generated at runtime. `SenderAvatarTest` regenerates them with
 * material-color-utilities and checks that they match.
 */
export const AVATAR_TONES: ReadonlyArray<{ readonly hue: number; readonly light: AvatarColors; readonly dark: AvatarColors }> = Object.freeze([
	{ hue: 25, light: { background: "#FFDAD6", foreground: "#3D0605" }, dark: { background: "#77312A", foreground: "#FFDAD6" } },
	{ hue: 55, light: { background: "#FFDCC5", foreground: "#301400" }, dark: { background: "#703801", foreground: "#FFDCC5" } },
	{ hue: 85, light: { background: "#FFDEA0", foreground: "#261900" }, dark: { background: "#5C4300", foreground: "#FFDEA0" } },
	{ hue: 120, light: { background: "#DBEB8E", foreground: "#181E00" }, dark: { background: "#404C00", foreground: "#DBEB8E" } },
	{ hue: 150, light: { background: "#B1F2B4", foreground: "#002108" }, dark: { background: "#135224", foreground: "#B1F2B4" } },
	{ hue: 185, light: { background: "#92F4E4", foreground: "#00201C" }, dark: { background: "#005048", foreground: "#92F4E4" } },
	{ hue: 220, light: { background: "#B1EBFF", foreground: "#001F27" }, dark: { background: "#004E5E", foreground: "#B1EBFF" } },
	{ hue: 260, light: { background: "#D5E3FF", foreground: "#001C3B" }, dark: { background: "#19477D", foreground: "#D5E3FF" } },
	{ hue: 295, light: { background: "#E6DEFF", foreground: "#1D0D50" }, dark: { background: "#493D7D", foreground: "#E6DEFF" } },
	{ hue: 330, light: { background: "#FFD6FB", foreground: "#340439" }, dark: { background: "#663468", foreground: "#FFD6FB" } },
])

/** M3 list item / Gmail avatar size. */
export const AVATAR_DEFAULT_SIZE = 40

/** Duration of the flip between the initial and the check mark when the selection changes. */
const FLIP_DURATION_MS = 150
/** M3 emphasized decelerate easing. */
const FLIP_EASING = "cubic-bezier(0.05, 0.7, 0.1, 1)"

/** The person an avatar stands for. */
export interface AvatarSender {
	address: string
	name?: string | null
}

/**
 * The letter shown in the avatar: the first letter or digit of the name, or of the address if there is no name
 * (skipping quotes, brackets and the like). Falls back to the first character, or an empty string if there is nothing at all.
 */
export function getAvatarInitial(name: string | null | undefined, address: string | null | undefined): string {
	const source = name?.trim() || address?.trim() || ""
	for (const char of source) {
		if (/[\p{L}\p{N}]/u.test(char)) return char.toLocaleUpperCase()
	}
	return Array.from(source)[0] ?? ""
}

/** 32 bit FNV-1a hash, stable across sessions and platforms. */
function hashString(value: string): number {
	let hash = 0x811c9dc5
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i)
		hash = Math.imul(hash, 0x01000193)
	}
	return hash >>> 0
}

/** The index into {@link AVATAR_TONES} for a sender. It only depends on the address (case-insensitive), or the name if there is no address. */
export function getAvatarToneIndex(sender: AvatarSender): number {
	const key = sender.address.trim().toLowerCase() || sender.name?.trim().toLowerCase() || ""
	return hashString(key) % AVATAR_TONES.length
}

/** The avatar colours for a sender in the current (or the given) theme brightness. */
export function getAvatarColors(sender: AvatarSender, isLight: boolean = isLightTheme()): AvatarColors {
	const tones = AVATAR_TONES[getAvatarToneIndex(sender)]
	return isLight ? tones.light : tones.dark
}

let reducedMotionQuery: MediaQueryList | null | undefined

function prefersReducedMotion(): boolean {
	if (reducedMotionQuery === undefined) {
		reducedMotionQuery =
			typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
	}
	return reducedMotionQuery?.matches ?? false
}

/**
 * Renders the static structure of an avatar: a circle with the initial and a (hidden) check mark. The content is set with {@link SenderAvatarDom}.
 * Purely decorative (`aria-hidden`): the sender's name is always shown or announced next to it.
 */
export function renderSenderAvatar(avatarSize: number = AVATAR_DEFAULT_SIZE, oncreate?: (dom: HTMLElement) => unknown): m.Children {
	// title-m for the default 40px, scaled for other sizes
	const fontSize = Math.round((avatarSize * type_scale["title-m"].size) / AVATAR_DEFAULT_SIZE)
	return m(
		".flex.items-center.justify-center.no-shrink.overflow-hidden",
		{
			"aria-hidden": "true",
			"data-testid": "sender-avatar",
			style: {
				width: px(avatarSize),
				height: px(avatarSize),
				borderRadius: px(shape.full),
				fontSize: px(fontSize),
				lineHeight: px(avatarSize),
				fontWeight: type_scale["title-m"].weight,
				userSelect: "none",
			},
			oncreate: oncreate ? (vnode: VnodeDOM) => oncreate(vnode.dom as HTMLElement) : undefined,
		},
		[
			m("span"),
			m(Icon, {
				icon: Icons.Checkmark,
				size: avatarSize <= 32 ? IconSize.PX20 : avatarSize <= 48 ? IconSize.PX24 : IconSize.PX32,
				style: { fill: "currentColor", display: "none" },
			}),
		],
	)
}

/**
 * Updates the DOM rendered by {@link renderSenderAvatar} by hand, touching it only when something changed.
 * This is for virtualised list rows that set their content without the vdom (see MailRow); components use {@link SenderAvatar}.
 */
export class SenderAvatarDom {
	private readonly initialDom: HTMLElement
	private readonly checkDom: HTMLElement
	private lastAddress: string | null = null
	private lastName: string | null = null
	private lastSelected: boolean | null = null
	private lastColorKey: string | null = null

	constructor(private readonly dom: HTMLElement) {
		this.initialDom = dom.firstElementChild as HTMLElement
		this.checkDom = dom.lastElementChild as HTMLElement
	}

	/**
	 * @param sender whose initial and colour to show
	 * @param selected show a check mark on the primary colour instead of the initial
	 * @param animate flip to the new state if only the selection changed (set it when the same item was toggled, not when a row is reused for another item)
	 */
	update(sender: AvatarSender, selected: boolean, animate: boolean): void {
		const name = sender.name ?? ""
		const senderChanged = sender.address !== this.lastAddress || name !== this.lastName
		const selectionChanged = selected !== this.lastSelected
		const isLight = isLightTheme()
		const colors = selected ? { background: theme.primary, foreground: theme.on_primary } : getAvatarColors(sender, isLight)
		const colorKey = colors.background + colors.foreground

		if (senderChanged) {
			this.initialDom.textContent = getAvatarInitial(sender.name, sender.address)
		}
		if (selectionChanged) {
			this.initialDom.style.display = selected ? "none" : ""
			this.checkDom.style.display = selected ? "" : "none"
			if (animate && !senderChanged && this.lastSelected != null && !prefersReducedMotion()) {
				this.dom.animate([{ transform: "rotateY(90deg)" }, { transform: "rotateY(0)" }], { duration: FLIP_DURATION_MS, easing: FLIP_EASING })
			}
		}
		if (colorKey !== this.lastColorKey) {
			this.dom.style.backgroundColor = colors.background
			this.dom.style.color = colors.foreground
		}

		this.lastAddress = sender.address
		this.lastName = name
		this.lastSelected = selected
		this.lastColorKey = colorKey
	}
}

export interface SenderAvatarAttrs extends AvatarSender {
	/** diameter in px, defaults to {@link AVATAR_DEFAULT_SIZE} */
	size?: number
	/** show a check mark instead of the initial */
	selected?: boolean
}

/**
 * Circular avatar with the initial of a mail sender, coloured deterministically from the address (generated locally, no network).
 * Decorative: label the surrounding element instead.
 */
export class SenderAvatar implements ClassComponent<SenderAvatarAttrs> {
	private avatarDom: SenderAvatarDom | null = null

	view({ attrs }: Vnode<SenderAvatarAttrs>): m.Children {
		return renderSenderAvatar(attrs.size, (dom) => {
			this.avatarDom = new SenderAvatarDom(dom)
			this.avatarDom.update(attrs, attrs.selected ?? false, false)
		})
	}

	onupdate({ attrs }: VnodeDOM<SenderAvatarAttrs>): void {
		this.avatarDom?.update(attrs, attrs.selected ?? false, true)
	}
}
