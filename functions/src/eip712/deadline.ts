import { config } from 'dotenv'

// Load environment variables from .env file
config()

/**
 * Calculates the deadline timestamp for EIP-712 signatures.
 *
 * This function retrieves the deadline duration from the EIP712_DEADLINE_MINUTES
 * environment variable and adds it to the current timestamp to determine
 * the expiration time for the signature.
 *
 * @returns {number} The deadline timestamp in seconds since the Unix epoch.
 * @throws {Error} If the EIP712_DEADLINE_MINUTES environment variable is not set or is invalid.
 */
export function getDeadline(): number {
	// Retrieve the deadline duration from the environment variable
	const deadlineMinutes: string | undefined = process.env.EIP712_DEADLINE_MINUTES

	// Validate the deadline duration
	if (!deadlineMinutes || isNaN(Number(deadlineMinutes))) {
		throw new Error('EIP712_DEADLINE_MINUTES environment variable must be set to a valid number')
	}

	// Get the current timestamp in seconds
	const currentTimestamp: number = Math.floor(Date.now() / 1000)

	// Calculate the deadline by adding the duration to the current timestamp
	return currentTimestamp + Number(deadlineMinutes) * 60
}
