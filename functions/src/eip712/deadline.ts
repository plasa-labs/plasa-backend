export function getDeadline(): number {
	const deadlineMinutes = process.env.EIP712_DEADLINE_MINUTES

	if (!deadlineMinutes || isNaN(Number(deadlineMinutes))) {
		throw new Error(
			'EIP712_DEADLINE_MINUTES environment variable is not set or is not a valid number'
		)
	}

	const currentTimestamp = Math.floor(Date.now() / 1000) // Current timestamp in seconds
	const deadlineSeconds = currentTimestamp + Number(deadlineMinutes) * 60

	return deadlineSeconds
}
