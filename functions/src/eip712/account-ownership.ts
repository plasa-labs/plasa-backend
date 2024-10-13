// import { getDeadline } from './deadline'
// import { EIP712Signer } from './eip712'
// import { Platform, instagram } from './platforms'

// /**
//  * Signs an account ownership message for a given platform using EIP-712.
//  * @param platform - The platform object containing contract addresses and name.
//  * @param id - The user's platform-specific identifier (e.g., username).
//  * @param recipient - The Ethereum address of the recipient.
//  * @returns A promise resolving to an object containing the signature and deadline.
//  */
// async function signAccountOwnership(
// 	platform: Platform,
// 	id: string,
// 	recipient: string
// ): Promise<{ signature: string; deadline: number }> {
// 	// Initialize EIP712Signer with the platform's ownership contract address
// 	const signer = new EIP712Signer(platform.ownershipContractAddress)

// 	// Define EIP-712 type structure for AccountOwnership
// 	const types = {
// 		AccountOwnership: [
// 			{ name: 'platform', type: 'string' },
// 			{ name: 'id', type: 'string' },
// 			{ name: 'recipient', type: 'address' },
// 			{ name: 'deadline', type: 'uint256' }
// 		]
// 	}

// 	const deadline = getDeadline()

// 	// Prepare the message data to be signed
// 	const message = { platform: platform.name, id, recipient, deadline }

// 	try {
// 		// Sign the typed data and retrieve the signature
// 		const signature = await signer.signTypedData(types, message, deadline)
// 		console.log(`${platform.name} Account Ownership Signature:`, signature)
// 		return { signature, deadline }
// 	} catch (error) {
// 		console.error('Error signing account ownership message:', error)
// 		throw error
// 	}
// }

// /**
//  * Signs an Instagram account ownership message using EIP-712.
//  * @param username - The Instagram username of the account owner.
//  * @param recipient - The Ethereum address of the recipient.
//  * @returns A promise resolving to an object containing the signature and deadline.
//  */
// async function signInstagramAccountOwnership(
// 	username: string,
// 	recipient: string
// ): Promise<{ signature: string; deadline: number }> {
// 	return signAccountOwnership(instagram, username, recipient)
// }

// // Example usage:
// // signInstagramAccountOwnership('user123', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB')

// export { signInstagramAccountOwnership }
