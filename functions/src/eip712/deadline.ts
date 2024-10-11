/**
 * Calculates the deadline timestamp based on the EIP712_DEADLINE_MINUTES environment variable.
 * @returns {number} The deadline timestamp in seconds.
 * @throws {Error} If the environment variable is not set or is invalid.
 */
export function getDeadline(): number {
	// Get the deadline minutes from the environment variable
	const deadlineMinutes: string | undefined = process.env.EIP712_DEADLINE_MINUTES

	// Check if the deadline minutes are set and valid
	if (!deadlineMinutes || isNaN(Number(deadlineMinutes))) {
		throw new Error(
			'EIP712_DEADLINE_MINUTES environment variable is not set or is not a valid number'
		)
	}

	// Calculate the current timestamp in seconds
	const currentTimestamp: number = Math.floor(Date.now() / 1000)

	// Calculate and return the deadline timestamp
	return currentTimestamp + Number(deadlineMinutes) * 60
}
