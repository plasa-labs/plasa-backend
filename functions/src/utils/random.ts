/**
 * Generates a random string of specified length.
 * @param length The length of the string to generate.
 * @returns A random string containing lowercase letters and numbers.
 */
export function generateRandomString(length: number): string {
	// Define the character set for the random string
	const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''

	// Generate the random string
	for (let i = 0; i < length; i++) {
		// Pick a random character from the character set
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}

	return result
}
