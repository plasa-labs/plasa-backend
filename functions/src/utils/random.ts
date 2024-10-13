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

/**
 * Generates a random Unix timestamp representing a follower's "since" date.
 * The date will be between June 12, 2024, and the current date.
 * @returns A random Unix timestamp.
 */
export function generateRandomFollowerSince(): number {
	const JUNE_12_2024 = 1718236800 // Unix timestamp for June 12, 2024
	const now = Math.floor(Date.now() / 1000) // Current Unix timestamp

	// Generate a random timestamp between June 12, 2024, and now
	return JUNE_12_2024 + Math.floor(Math.random() * (now - JUNE_12_2024))
}
