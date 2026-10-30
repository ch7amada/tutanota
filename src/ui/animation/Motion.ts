import type { EasingFunction } from "./Easing"

/**
 * A spring as Material 3 specifies it: damping ratio and stiffness, with a mass of 1.
 * A damping ratio below 1 overshoots (bounces), 1 or more does not.
 */
export interface SpringSpec {
	readonly dampingRatio: number
	readonly stiffness: number
}

/**
 * The Material 3 Expressive motion scheme. Each token is used through the helpers below, by name.
 *
 * - spatial springs move things: position, size, shape, rotation. Expressive spatial springs overshoot a little.
 * - effects springs change colour and opacity. They never overshoot.
 *
 * fast is for small components (button shape, switch), default for medium ones (FAB, navigation indicator, sheets),
 * slow for full-screen transitions.
 *
 * See https://m3.material.io/styles/motion/overview/specs
 */
export const spring_tokens = {
	fast_spatial: { dampingRatio: 0.6, stiffness: 800 },
	default_spatial: { dampingRatio: 0.8, stiffness: 380 },
	slow_spatial: { dampingRatio: 0.8, stiffness: 200 },
	fast_effects: { dampingRatio: 1, stiffness: 3800 },
	default_effects: { dampingRatio: 1, stiffness: 1600 },
	slow_effects: { dampingRatio: 1, stiffness: 800 },
} as const satisfies Record<string, SpringSpec>

export type SpringToken = keyof typeof spring_tokens

/** A spring counts as settled once it stays this close to its target (relative to the distance travelled). */
const SETTLE_THRESHOLD = 0.001
/** Easing for browsers without CSS `linear()` (Safari < 17.2). The M3 standard curve, which a spring resembles without the bounce. */
const FALLBACK_CSS_EASING = "cubic-bezier(0.2, 0, 0, 1)"
/** How far the CSS `linear()` approximation may stray from the spring. */
const LINEAR_EASING_TOLERANCE = 0.002

/**
 * Position of a spring that starts at rest at 0 and is pulled towards 1, after {@param timeMs}.
 */
export function springValue(spec: SpringSpec, timeMs: number): number {
	const t = Math.max(0, timeMs) / 1000
	const omega = Math.sqrt(spec.stiffness)
	const zeta = spec.dampingRatio
	if (zeta < 1) {
		const dampedOmega = omega * Math.sqrt(1 - zeta * zeta)
		const decay = Math.exp(-zeta * omega * t)
		return 1 - decay * (Math.cos(dampedOmega * t) + ((zeta * omega) / dampedOmega) * Math.sin(dampedOmega * t))
	} else if (zeta === 1) {
		return 1 - Math.exp(-omega * t) * (1 + omega * t)
	} else {
		const root = omega * Math.sqrt(zeta * zeta - 1)
		const r1 = -zeta * omega + root
		const r2 = -zeta * omega - root
		return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1)
	}
}

const durationCache = new Map<SpringSpec, number>()

/**
 * How long the spring takes to settle, in ms. Use it as the duration of an animation or transition driven by this spring.
 */
export function springDuration(spec: SpringSpec): number {
	let duration = durationCache.get(spec)
	if (duration == null) {
		// find the last moment at which the spring is still noticeably away from its target
		let lastUnsettled = 0
		for (let timeMs = 0; timeMs <= 10000; timeMs++) {
			if (Math.abs(1 - springValue(spec, timeMs)) > SETTLE_THRESHOLD) {
				lastUnsettled = timeMs
			}
		}
		duration = lastUnsettled + 1
		durationCache.set(spec, duration)
	}
	return duration
}

/**
 * The spring as an easing function over {@link springDuration} (0 → 0, 1 → exactly 1, may overshoot in between),
 * for the JS animation engine (`animations.add(…, { easing, duration })`).
 */
export function springEasing(spec: SpringSpec): EasingFunction {
	const duration = springDuration(spec)
	return (percent: number) => (percent >= 1 ? 1 : springValue(spec, percent * duration))
}

/**
 * The spring as a CSS `linear()` easing over {@link springDuration}, e.g. `linear(0, 0.12 4.5%, …, 1)`.
 * Prefer the `--motion-*` custom properties (see {@link springTransition}), they fall back for browsers without `linear()`.
 */
export function springLinearEasing(spec: SpringSpec): string {
	const duration = springDuration(spec)
	const sampleCount = 200
	const samples: Array<[number, number]> = []
	for (let i = 0; i <= sampleCount; i++) {
		const progress = i / sampleCount
		samples.push([progress, i === sampleCount ? 1 : springValue(spec, progress * duration)])
	}
	const points = simplify(samples, LINEAR_EASING_TOLERANCE)
	const stops = points.map(([progress, value], index) => {
		if (index === 0 || index === points.length - 1) return formatNumber(value, 3)
		return `${formatNumber(value, 3)} ${formatNumber(progress * 100, 2)}%`
	})
	return `linear(${stops.join(", ")})`
}

/** Ramer-Douglas-Peucker: drop the points that lie within {@param tolerance} of the line between their neighbours. */
function simplify(points: Array<[number, number]>, tolerance: number): Array<[number, number]> {
	if (points.length <= 2) return points
	const [startX, startY] = points[0]
	const [endX, endY] = points[points.length - 1]
	let maxDistance = 0
	let maxIndex = 0
	for (let i = 1; i < points.length - 1; i++) {
		const [x, y] = points[i]
		const lineY = startY + ((endY - startY) * (x - startX)) / (endX - startX)
		const distance = Math.abs(y - lineY)
		if (distance > maxDistance) {
			maxDistance = distance
			maxIndex = i
		}
	}
	if (maxDistance <= tolerance) return [points[0], points[points.length - 1]]
	const left = simplify(points.slice(0, maxIndex + 1), tolerance)
	const right = simplify(points.slice(maxIndex), tolerance)
	return [...left.slice(0, -1), ...right]
}

function formatNumber(value: number, decimals: number): string {
	return String(Number(value.toFixed(decimals)))
}

function cssTokenName(token: SpringToken): string {
	return `--motion-${token.replace(/_/g, "-")}`
}

/**
 * CSS custom properties for every spring token, for `:root`: `--motion-<token>` is the easing (e.g. `--motion-default-spatial`)
 * and `--motion-<token>-duration` its duration.
 * @param easing "linear" for browsers that support `linear()`, "fallback" for the others.
 */
export function springCustomProperties(easing: "linear" | "fallback"): Record<string, string> {
	const properties: Record<string, string> = {}
	for (const token of Object.keys(spring_tokens) as SpringToken[]) {
		const spec = spring_tokens[token]
		properties[cssTokenName(token)] = easing === "linear" ? springLinearEasing(spec) : FALLBACK_CSS_EASING
		if (easing === "fallback") {
			properties[`${cssTokenName(token)}-duration`] = `${springDuration(spec)}ms`
		}
	}
	return properties
}

/** With reduced motion every spring finishes instantly; for `:root` inside `@media (prefers-reduced-motion: reduce)`. */
export function reducedMotionSpringCustomProperties(): Record<string, string> {
	const properties: Record<string, string> = {}
	for (const token of Object.keys(spring_tokens) as SpringToken[]) {
		properties[`${cssTokenName(token)}-duration`] = "0ms"
	}
	return properties
}

/**
 * The custom properties of the spring {@param token} as CSS values: `var(--motion-<token>)` and `var(--motion-<token>-duration)`.
 * Both honour reduced motion and browsers without `linear()`.
 */
export function springCssVars(token: SpringToken): { easing: string; duration: string } {
	const name = cssTokenName(token)
	return { easing: `var(${name})`, duration: `var(${name}-duration)` }
}

/**
 * A CSS `transition` value that moves {@param properties} with the spring {@param token}, e.g.
 * `springTransition("default_spatial", "transform")` → `transform var(--motion-default-spatial-duration) var(--motion-default-spatial)`.
 * Honours reduced motion (the duration becomes 0).
 */
export function springTransition(token: SpringToken, ...properties: string[]): string {
	const { easing, duration } = springCssVars(token)
	return properties.map((property) => `${property} ${duration} ${easing}`).join(", ")
}

/**
 * Options for the JS animation engine that drive an animation with the spring {@param token}:
 * `animations.add(dom, transform(…), springAnimationOptions("default_spatial"))`.
 * With reduced motion the animation jumps to its end state in the first frame.
 */
export function springAnimationOptions(token: SpringToken): { easing: EasingFunction; duration: number } {
	if (prefersReducedMotion()) {
		return { easing: () => 1, duration: 1 }
	}
	const spec = spring_tokens[token]
	return { easing: springEasing(spec), duration: springDuration(spec) }
}

let reducedMotionQuery: MediaQueryList | null | undefined

/**
 * Whether the user asked the system to reduce motion. Check it before running a spring, morph or other
 * decorative animation from JS; CSS that uses the `--motion-*` properties handles it by itself.
 */
export function prefersReducedMotion(): boolean {
	if (reducedMotionQuery === undefined) {
		reducedMotionQuery =
			typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
	}
	return reducedMotionQuery?.matches ?? false
}
