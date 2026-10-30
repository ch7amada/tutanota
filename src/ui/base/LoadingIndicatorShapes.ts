/**
 * Geometry for the Material 3 Expressive loading indicator.
 *
 * Every shape is described as a polar function (radius per angle) and sampled at the same angles, then turned into a smooth closed path made of
 * the same number of cubic bézier segments. Because all paths share an identical command structure, the browser can interpolate between them
 * (SMIL `<animate attributeName="d">`), which gives the continuous morph without any runtime geometry work or extra dependency.
 *
 * The sequence follows the M3 Expressive indeterminate loading indicator: soft burst, 9-sided cookie, pentagon, pill, sunny, 4-sided cookie, oval.
 */

/** Side length of the square viewBox the paths are drawn in. */
export const LOADING_INDICATOR_VIEWBOX = 100
const CENTER = LOADING_INDICATOR_VIEWBOX / 2
/** Largest radius of any shape. Leaves some room so that the rotating shape is never clipped. */
const MAX_RADIUS = 45
/** Number of sampled points (and therefore cubic segments) per shape. Must be the same for all shapes so that they can be interpolated. */
export const LOADING_INDICATOR_SAMPLES = 80

type Point = readonly [number, number]
/** Radius (any unit, normalized later) for a given angle in radians. */
type PolarShape = (angle: number) => number

function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point): number {
	const dx = bx - ax
	const dy = by - ay
	const lengthSquared = dx * dx + dy * dy
	const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
	return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Distance from a point to a convex polygon (vertices in counter-clockwise order), 0 if the point is inside. */
function distanceToConvexPolygon(point: Point, vertices: readonly Point[]): number {
	let inside = vertices.length > 2
	let distance = Infinity
	for (let i = 0; i < vertices.length; i++) {
		const a = vertices[i]
		const b = vertices[(i + 1) % vertices.length]
		const cross = (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0])
		if (cross < 0) inside = false
		distance = Math.min(distance, distanceToSegment(point, a, b))
	}
	return inside ? 0 : distance
}

/**
 * A convex polygon with rounded corners: the Minkowski sum of {@param vertices} and a disk of radius {@param rounding}.
 * The radius along a ray from the origin is found by bisection, which works because the distance to a convex shape grows monotonically along
 * a ray that starts inside of it. A two-vertex "polygon" gives a stadium (pill).
 */
function roundedConvex(vertices: readonly Point[], rounding: number): PolarShape {
	return (angle) => {
		const dx = Math.cos(angle)
		const dy = Math.sin(angle)
		let low = 0
		let high = 4
		for (let i = 0; i < 40; i++) {
			const mid = (low + high) / 2
			if (distanceToConvexPolygon([mid * dx, mid * dy], vertices) < rounding) {
				low = mid
			} else {
				high = mid
			}
		}
		return low
	}
}

function regularPolygon(sides: number, rounding: number, rotation: number): PolarShape {
	const vertices: Point[] = []
	for (let i = 0; i < sides; i++) {
		const angle = rotation + (i * 2 * Math.PI) / sides
		vertices.push([(1 - rounding) * Math.cos(angle), (1 - rounding) * Math.sin(angle)])
	}
	return roundedConvex(vertices, rounding)
}

/**
 * A round shape with {@param lobes} pointed-ish tips (burst, sunny). Smooth everywhere so the spline through the samples has no kinks.
 * @param depth how far the valleys between the tips reach in (relative to the outer radius)
 * @param sharpness >= 1, higher values give narrower tips and broader valleys
 */
function pointed(lobes: number, depth: number, sharpness: number, rotation: number): PolarShape {
	return (angle) => {
		const wave = (1 + Math.cos(lobes * (angle - rotation))) / 2
		return 1 - depth * (1 - Math.pow(wave, sharpness))
	}
}

/**
 * A round shape with {@param lobes} broad round bumps separated by narrow rounded notches (cookie).
 * @param depth how far the notches reach in (relative to the outer radius)
 * @param flatness >= 1, higher values give broader lobes and narrower notches
 */
function scalloped(lobes: number, depth: number, flatness: number, rotation: number): PolarShape {
	return (angle) => {
		const notch = (1 - Math.cos(lobes * (angle - rotation))) / 2
		return 1 - depth * Math.pow(notch, flatness)
	}
}

function ellipse(width: number, height: number, rotation: number): PolarShape {
	return (angle) => {
		const a = angle - rotation
		return (width * height) / Math.hypot(height * Math.cos(a), width * Math.sin(a))
	}
}

const UP = -Math.PI / 2
const DIAGONAL = -Math.PI / 4

const SHAPES: readonly PolarShape[] = [
	// soft burst
	pointed(10, 0.22, 1.6, UP),
	// cookie, 9 sides
	scalloped(9, 0.12, 2.5, UP),
	// pentagon
	regularPolygon(5, 0.22, UP),
	// pill
	roundedConvex(
		[
			[-0.45 * Math.cos(DIAGONAL), -0.45 * Math.sin(DIAGONAL)],
			[0.45 * Math.cos(DIAGONAL), 0.45 * Math.sin(DIAGONAL)],
		],
		0.55,
	),
	// sunny
	pointed(8, 0.12, 1.2, UP),
	// cookie, 4 sides
	scalloped(4, 0.2, 3, DIAGONAL),
	// oval
	ellipse(1, 0.64, DIAGONAL),
]

function samplePoints(shape: PolarShape): Point[] {
	const angles = Array.from({ length: LOADING_INDICATOR_SAMPLES }, (_, i) => UP + (i * 2 * Math.PI) / LOADING_INDICATOR_SAMPLES)
	const radii = angles.map(shape)
	const scale = MAX_RADIUS / Math.max(...radii)
	return angles.map((angle, i) => [CENTER + radii[i] * scale * Math.cos(angle), CENTER + radii[i] * scale * Math.sin(angle)])
}

function format(n: number): string {
	// one decimal is far below a device pixel at the sizes this is rendered in
	return String(Math.round(n * 10) / 10)
}

/** Closed Catmull-Rom spline through the points, expressed as cubic béziers: "M x y C ... C ... Z" with exactly one C per point. */
function smoothClosedPath(points: readonly Point[]): string {
	const n = points.length
	const at = (i: number) => points[(i + n) % n]
	let d = `M${format(points[0][0])} ${format(points[0][1])}`
	for (let i = 0; i < n; i++) {
		const p0 = at(i - 1)
		const p1 = at(i)
		const p2 = at(i + 1)
		const p3 = at(i + 2)
		const c1x = p1[0] + (p2[0] - p0[0]) / 6
		const c1y = p1[1] + (p2[1] - p0[1]) / 6
		const c2x = p2[0] - (p3[0] - p1[0]) / 6
		const c2y = p2[1] - (p3[1] - p1[1]) / 6
		d += `C${format(c1x)} ${format(c1y)} ${format(c2x)} ${format(c2y)} ${format(p2[0])} ${format(p2[1])}`
	}
	return d + "Z"
}

let cachedPaths: readonly string[] | null = null

/** The morph sequence as SVG path data. All entries have the same command structure. Computed once, on first use. */
export function loadingIndicatorPaths(): readonly string[] {
	if (cachedPaths == null) {
		cachedPaths = SHAPES.map((shape) => smoothClosedPath(samplePoints(shape)))
	}
	return cachedPaths
}
