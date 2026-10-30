import m, { Children, Component, Vnode } from "mithril"
import { theme } from "../theme"
import { LOADING_INDICATOR_VIEWBOX, loadingIndicatorPaths } from "./LoadingIndicatorShapes.js"
import { prefersReducedMotion } from "../animation/Motion.js"

export type LoadingIndicatorAttrs = {
	/** extra classes for the container, e.g. a size class like "icon-24" (defaults to the 16px `.icon` size, same as {@link Icon}) */
	class?: string
	style?: Record<string, any>
	container?: "span" | "div" // defaults to "span"
}

/** Duration of a single morph from one shape to the next. */
const MORPH_DURATION_MS = 650
/** Duration of one full turn of the continuous rotation that runs underneath the morphs. */
const GLOBAL_ROTATION_DURATION_MS = 4666
/** Emphasized, fast-out easing for each morph step (SMIL keySplines must stay within [0, 1], so no spring overshoot). */
const MORPH_EASING = "0.2 0 0 1"

const CENTER = LOADING_INDICATOR_VIEWBOX / 2

type Animation = {
	morph: { values: string; keyTimes: string; keySplines: string; dur: string }
	stepRotation: { values: string }
}

let cachedAnimation: Animation | null = null

function animation(): Animation {
	if (cachedAnimation == null) {
		const paths = loadingIndicatorPaths()
		const steps = paths.length
		// each morph also turns the shape a bit; pick the step so that a full cycle adds up to whole turns and loops seamlessly
		const stepAngle = 720 / steps
		const keyTimes = Array.from({ length: steps + 1 }, (_, i) => String(Math.round((i / steps) * 10000) / 10000))
		keyTimes[steps] = "1"
		cachedAnimation = {
			morph: {
				values: [...paths, paths[0]].join(";"),
				keyTimes: keyTimes.join(";"),
				keySplines: Array.from({ length: steps }, () => MORPH_EASING).join(";"),
				dur: `${MORPH_DURATION_MS * steps}ms`,
			},
			stepRotation: {
				values: Array.from({ length: steps + 1 }, (_, i) => `${Math.round(i * stepAngle * 1000) / 1000} ${CENTER} ${CENTER}`).join(";"),
			},
		}
	}
	return cachedAnimation
}

/**
 * Material 3 Expressive loading indicator: a shape that continuously morphs through a sequence of rounded shapes while rotating, in the primary colour.
 *
 * It is a drop-in replacement for the previous rotating sync icon: same container element, same size classes and the same accessibility
 * semantics (purely decorative, `aria-hidden`; any busy/progress text stays with the caller).
 *
 * The animation is declarative SMIL so it needs no timers or redraws. When the user prefers reduced motion there is no morphing or rotation,
 * the shape only gently pulses its opacity.
 */
export class LoadingIndicator implements Component<LoadingIndicatorAttrs> {
	view({ attrs }: Vnode<LoadingIndicatorAttrs>): Children {
		const container = attrs.container ?? "span"
		return m(
			`${container}.icon.loading-indicator`,
			{
				"aria-hidden": "true",
				class: attrs.class ?? "",
				style: { fill: theme.primary, ...attrs.style },
			},
			m(
				"svg",
				{ viewBox: `0 0 ${LOADING_INDICATOR_VIEWBOX} ${LOADING_INDICATOR_VIEWBOX}` },
				prefersReducedMotion() ? this.renderStatic() : this.renderAnimated(),
			),
		)
	}

	private renderAnimated(): Children {
		const { morph, stepRotation } = animation()
		return m("g", [
			m("animateTransform", {
				attributeName: "transform",
				type: "rotate",
				from: `0 ${CENTER} ${CENTER}`,
				to: `360 ${CENTER} ${CENTER}`,
				dur: `${GLOBAL_ROTATION_DURATION_MS}ms`,
				repeatCount: "indefinite",
			}),
			m("g", [
				m("animateTransform", {
					attributeName: "transform",
					type: "rotate",
					values: stepRotation.values,
					keyTimes: morph.keyTimes,
					keySplines: morph.keySplines,
					calcMode: "spline",
					dur: morph.dur,
					repeatCount: "indefinite",
				}),
				m(
					"path",
					{ d: loadingIndicatorPaths()[0] },
					m("animate", {
						attributeName: "d",
						values: morph.values,
						keyTimes: morph.keyTimes,
						keySplines: morph.keySplines,
						calcMode: "spline",
						dur: morph.dur,
						repeatCount: "indefinite",
					}),
				),
			]),
		])
	}

	private renderStatic(): Children {
		return m(
			"path",
			{ d: loadingIndicatorPaths()[0] },
			m("animate", {
				attributeName: "opacity",
				values: "1;0.45;1",
				keyTimes: "0;0.5;1",
				keySplines: "0.4 0 0.6 1;0.4 0 0.6 1",
				calcMode: "spline",
				dur: "2000ms",
				repeatCount: "indefinite",
			}),
		)
	}
}
