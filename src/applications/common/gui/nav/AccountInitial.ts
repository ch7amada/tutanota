/**
 * First letter of the user's name, or of the mail address when there is no name, for the account avatar. Takes a whole code point so that
 * characters outside the BMP are not split. Empty if there is nothing to show.
 */
export function getAccountInitial(name: string, mailAddress: string): string {
	const source = name.trim() || mailAddress.trim()
	const first = Array.from(source)[0] ?? ""
	return first.toLocaleUpperCase()
}
