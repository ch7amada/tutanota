import o from "@tutao/otest"
import { LOADING_INDICATOR_SAMPLES, LOADING_INDICATOR_VIEWBOX, loadingIndicatorPaths } from "../../../../src/ui/base/LoadingIndicatorShapes.js"

o.spec("LoadingIndicatorShapes", () => {
	const commandStructure = (d: string) => d.replace(/[^A-Za-z]/g, "")
	const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

	o.test("there is a sequence of several shapes", () => {
		o.check(loadingIndicatorPaths().length).equals(7)
	})

	o.test("all shapes share the same command structure so that they can be morphed", () => {
		const expected = "M" + "C".repeat(LOADING_INDICATOR_SAMPLES) + "Z"
		for (const d of loadingIndicatorPaths()) {
			o.check(commandStructure(d)).equals(expected)
			o.check(numbers(d).length).equals(2 + 6 * LOADING_INDICATOR_SAMPLES)
		}
	})

	o.test("all shapes stay inside the viewBox, also while rotating", () => {
		const center = LOADING_INDICATOR_VIEWBOX / 2
		for (const d of loadingIndicatorPaths()) {
			const values = numbers(d)
			for (let i = 0; i < values.length; i += 2) {
				const distance = Math.hypot(values[i] - center, values[i + 1] - center)
				o.check(distance <= center).equals(true)
			}
		}
	})

	o.test("shapes are distinct", () => {
		o.check(new Set(loadingIndicatorPaths()).size).equals(loadingIndicatorPaths().length)
	})
})
