import o from "@tutao/otest"
import {
	reducedMotionSpringCustomProperties,
	spring_tokens,
	springAnimationOptions,
	springDuration,
	springEasing,
	springLinearEasing,
	SpringToken,
	springTransition,
	springValue,
} from "../../../../src/ui/animation/Motion.js"

o.spec("Motion", () => {
	const tokens = Object.keys(spring_tokens) as SpringToken[]
	const isSpatial = (token: SpringToken) => token.endsWith("_spatial")

	/** samples the easing every 1% of its duration */
	const samples = (token: SpringToken) => {
		const easing = springEasing(spring_tokens[token])
		return Array.from({ length: 101 }, (_, i) => easing(i / 100))
	}

	o.spec("spring curve", () => {
		o.test("starts at 0 and ends exactly at 1", () => {
			for (const token of tokens) {
				const easing = springEasing(spring_tokens[token])
				o.check(easing(0)).equals(0)(token)
				o.check(easing(1)).equals(1)(token)
			}
		})

		o.test("has settled at the end of its duration", () => {
			for (const token of tokens) {
				const spec = spring_tokens[token]
				const duration = springDuration(spec)
				for (let timeMs = duration; timeMs < duration + 2000; timeMs += 10) {
					o.check(Math.abs(1 - springValue(spec, timeMs)) <= 0.001).equals(true)(`${token} at ${timeMs}ms`)
				}
			}
		})

		o.test("durations are plausible and ordered fast < default < slow", () => {
			for (const kind of ["spatial", "effects"]) {
				const fast = springDuration(spring_tokens[`fast_${kind}` as SpringToken])
				const normal = springDuration(spring_tokens[`default_${kind}` as SpringToken])
				const slow = springDuration(spring_tokens[`slow_${kind}` as SpringToken])
				o.check(fast < normal && normal < slow).equals(true)(kind)
				o.check(fast >= 100 && slow <= 1000).equals(true)(kind)
			}
		})

		o.test("expressive spatial springs overshoot, but not by more than 10%", () => {
			for (const token of tokens.filter(isSpatial)) {
				const max = Math.max(...samples(token))
				o.check(max > 1).equals(true)(token)
				o.check(max <= 1.1).equals(true)(token)
			}
		})

		o.test("effects springs never overshoot and only move forward", () => {
			for (const token of tokens.filter((token) => !isSpatial(token))) {
				const values = samples(token)
				for (let i = 1; i < values.length; i++) {
					o.check(values[i] <= 1).equals(true)(token)
					o.check(values[i] >= values[i - 1]).equals(true)(token)
				}
			}
		})

		o.test("never goes below the start", () => {
			for (const token of tokens) {
				o.check(Math.min(...samples(token)) >= 0).equals(true)(token)
			}
		})

		o.test("overdamped springs also go from 0 to 1", () => {
			const spec = { dampingRatio: 2, stiffness: 400 }
			const easing = springEasing(spec)
			o.check(easing(0)).equals(0)
			o.check(Math.abs(1 - springValue(spec, springDuration(spec))) <= 0.001).equals(true)
		})
	})

	o.spec("CSS linear() easing", () => {
		const parse = (linear: string) => {
			const match = /^linear\((.*)\)$/.exec(linear)
			if (match == null) throw new Error(`not a linear() easing: ${linear}`)
			return match[1].split(", ").map((stop) => {
				const [value, percent] = stop.split(" ")
				return { value: Number(value), percent: percent == null ? null : Number(percent.replace(/%$/, "")) }
			})
		}

		o.test("is well-formed: starts at 0, ends at 1, stops in increasing order", () => {
			for (const token of tokens) {
				const linear = springLinearEasing(spring_tokens[token])
				o.check(/^linear\(0(, -?\d+(\.\d+)? \d+(\.\d+)?%)+, 1\)$/.test(linear)).equals(true)(linear)
				const stops = parse(linear)
				const percents = stops.map((stop) => stop.percent).filter((percent): percent is number => percent != null)
				for (let i = 1; i < percents.length; i++) {
					o.check(percents[i] > percents[i - 1]).equals(true)(linear)
				}
				o.check(percents[0] > 0 && percents[percents.length - 1] < 100).equals(true)(linear)
				o.check(stops.every((stop) => Number.isFinite(stop.value))).equals(true)(linear)
			}
		})

		o.test("follows the spring closely", () => {
			for (const token of tokens) {
				const spec = spring_tokens[token]
				const stops = parse(springLinearEasing(spec))
				const points = stops.map((stop, i) => ({ value: stop.value, progress: i === 0 ? 0 : i === stops.length - 1 ? 1 : stop.percent! / 100 }))
				const easing = springEasing(spec)
				for (let i = 0; i <= 100; i++) {
					const progress = i / 100
					const next = points.findIndex((point) => point.progress >= progress)
					const a = points[Math.max(0, next - 1)]
					const b = points[next]
					const interpolated =
						b.progress === a.progress ? b.value : a.value + ((b.value - a.value) * (progress - a.progress)) / (b.progress - a.progress)
					o.check(Math.abs(interpolated - easing(progress)) < 0.01).equals(true)(`${token} at ${progress}`)
				}
			}
		})

		o.test("is short enough to be inlined", () => {
			for (const token of tokens) {
				o.check(springLinearEasing(spring_tokens[token]).length < 600).equals(true)(token)
			}
		})
	})

	o.spec("CSS helpers", () => {
		o.test("springTransition uses the custom properties", () => {
			o.check(springTransition("default_spatial", "transform", "width")).equals(
				"transform var(--motion-default-spatial-duration) var(--motion-default-spatial), width var(--motion-default-spatial-duration) var(--motion-default-spatial)",
			)
		})

		o.test("reduced motion makes every spring instant", () => {
			const properties = reducedMotionSpringCustomProperties()
			o.check(Object.keys(properties).length).equals(tokens.length)
			o.check(Object.values(properties).every((value) => value === "0ms")).equals(true)
		})
	})

	o.spec("JS animation options", () => {
		o.test("drive the animation with the spring over its duration", () => {
			const options = springAnimationOptions("fast_spatial")
			o.check(options.duration).equals(springDuration(spring_tokens.fast_spatial))
			o.check(options.easing(1)).equals(1)
		})
	})
})
