import { EIP712Signer } from './eip712'
import { Platform, instagram } from './platforms'

/**
 * Signs an account ownership message for a given platform.
 * @param platform - The platform object containing contract addresses.
 * @param id - The user's platform-specific identifier.
 * @param recipient - The Ethereum address of the recipient.
 * @returns A promise resolving to the signature and deadline.
 */
async function signAccountOwnership(
	platform: Platform,
	id: string,
	recipient: string
): Promise<{ signature: string; deadline: number }> {
	// Create an EIP712Signer instance with the platform's ownership contract address
	const signer = new EIP712Signer(platform.ownershipContractAddress)

	// Define the EIP-712 type structure for AccountOwnership
	const types = {
		AccountOwnership: [
			{ name: 'platform', type: 'string' },
			{ name: 'id', type: 'string' },
			{ name: 'recipient', type: 'address' },
			{ name: 'deadline', type: 'uint256' }
		]
	}

	// Prepare the message to be signed
	const message = { platform: platform.name, id, recipient }

	try {
		// Sign the typed data and get the signature and deadline
		const { signature, deadline } = await signer.signTypedData(types, message)
		console.log(`${platform.name} Account Ownership Signature:`, signature)
		return { signature, deadline }
	} catch (error) {
		console.error('Error signing account ownership message:', error)
		throw error
	}
}

/**
 * Signs an Instagram account ownership message.
 * @param username - The Instagram username.
 * @param recipient - The Ethereum address of the recipient.
 * @returns A promise resolving to the signature and deadline.
 */
async function signInstagramAccountOwnership(
	username: string,
	recipient: string
): Promise<{ signature: string; deadline: number }> {
	return signAccountOwnership(instagram, username, recipient)
}

// Example usage:
// signInstagramAccountOwnership('user123', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB')

export { signInstagramAccountOwnership }
