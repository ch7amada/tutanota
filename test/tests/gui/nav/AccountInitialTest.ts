import o from "@tutao/otest"
import { getAccountInitial } from "../../../../src/applications/common/gui/nav/AccountInitial.js"

o.spec("AccountInitial", () => {
	o.test("uses the first letter of the name, upper case", () => {
		o.check(getAccountInitial(" alice Example", "bob@tuta.com")).equals("A")
	})

	o.test("falls back to the mail address when there is no name", () => {
		o.check(getAccountInitial("  ", "bob@tuta.com")).equals("B")
	})

	o.test("does not split characters outside the BMP", () => {
		o.check(getAccountInitial("𝒜lice", "")).equals("𝒜")
	})

	o.test("is empty when there is nothing to show", () => {
		o.check(getAccountInitial("", "")).equals("")
	})
})
