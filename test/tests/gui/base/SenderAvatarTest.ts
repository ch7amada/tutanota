import o from "@tutao/otest"
import { TonalPalette, hexFromArgb } from "@material/material-color-utilities"
import { AVATAR_TONES, getAvatarColors, getAvatarInitial, getAvatarToneIndex } from "../../../../src/ui/base/SenderAvatar.js"

function luminance(hex: string): number {
	const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(a: string, b: string): number {
	const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (l1 + 0.05) / (l2 + 0.05)
}

o.spec("SenderAvatar", () => {
	o.test("baked tones match the M3 tonal palettes", () => {
		for (const { hue, light, dark } of AVATAR_TONES) {
			const palette = TonalPalette.fromHueAndChroma(hue, 40)
			const tone = (t: number) => hexFromArgb(palette.tone(t)).toUpperCase()
			o.check(light).deepEquals({ background: tone(90), foreground: tone(10) })
			o.check(dark).deepEquals({ background: tone(30), foreground: tone(90) })
		}
	})

	o.test("initial has at least 4.5:1 contrast in light and dark", () => {
		for (const { light, dark } of AVATAR_TONES) {
			o.check(contrast(light.background, light.foreground) >= 4.5).equals(true)
			o.check(contrast(dark.background, dark.foreground) >= 4.5).equals(true)
		}
	})

	o.test("colour is stable per sender and ignores case and name", () => {
		const a = getAvatarToneIndex({ address: "Alice@Example.org", name: "Alice" })
		o.check(getAvatarToneIndex({ address: "alice@example.org", name: "Someone else" })).equals(a)
		o.check(getAvatarColors({ address: "alice@example.org" }, true)).equals(AVATAR_TONES[a].light)
		o.check(getAvatarColors({ address: "alice@example.org" }, false)).equals(AVATAR_TONES[a].dark)
	})

	o.test("different senders spread over the palette", () => {
		const used = new Set<number>()
		for (let i = 0; i < 100; i++) used.add(getAvatarToneIndex({ address: `user${i}@example.org` }))
		o.check(used.size).equals(AVATAR_TONES.length)
	})

	o.test("initial", () => {
		o.check(getAvatarInitial("bob", "x@y.z")).equals("B")
		o.check(getAvatarInitial('"Émile" <e>', "")).equals("É")
		o.check(getAvatarInitial(null, "  zoe@example.org")).equals("Z")
		o.check(getAvatarInitial("", "")).equals("")
		o.check(getAvatarInitial("--", null)).equals("-")
	})
})
