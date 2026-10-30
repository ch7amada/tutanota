import o from "@tutao/otest"
import { FabScrollState } from "../../../../src/ui/base/FloatingActionButton.js"

o.spec("FabScrollState", function () {
	o.test("starts expanded", function () {
		o.check(new FabScrollState().collapsed).equals(false)
	})

	o.test("collapses on scroll down and expands on scroll up", function () {
		const state = new FabScrollState()
		o.check(state.onScroll(100)).equals(true)
		o.check(state.collapsed).equals(true)
		o.check(state.onScroll(50)).equals(true)
		o.check(state.collapsed).equals(false)
	})

	o.test("ignores small movements but adds up slow scrolling", function () {
		const state = new FabScrollState()
		o.check(state.onScroll(4)).equals(false)
		o.check(state.collapsed).equals(false)
		o.check(state.onScroll(10)).equals(true)
		o.check(state.collapsed).equals(true)
		o.check(state.onScroll(5)).equals(false)
		o.check(state.collapsed).equals(true)
	})

	o.test("expands at the top and after reset", function () {
		const state = new FabScrollState()
		state.onScroll(200)
		o.check(state.onScroll(0)).equals(true)
		o.check(state.collapsed).equals(false)
		state.onScroll(200)
		state.reset()
		o.check(state.collapsed).equals(false)
	})
})
