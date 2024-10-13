// import { EIP712Signer } from './eip712'
// import { Platform, instagram } from './platforms'

// /**
//  * Signs a follower-since message for a given platform.
//  * @param platform - The platform object containing contract addresses.
//  * @param followed - The username of the followed account.
//  * @param follower - The username of the follower account.
//  * @param since - The timestamp when the follow relationship started.
//  * @param recipient - The Ethereum address of the recipient.
//  * @returns A promise resolving to the signature and deadline.
//  */
// async function signFollowerSince(
// 	platform: Platform,
// 	followed: string,
// 	follower: string,
// 	since: number,
// 	recipient: string
// ): Promise<{ signature: string; deadline: number }> {
// 	// Create an EIP712Signer instance with the platform's contract address
// 	const signer = new EIP712Signer(platform.followerSinceContractAddress)

// 	// Define the EIP-712 types for the FollowerSince struct
// 	const types = {
// 		FollowerSince: [
// 			{ name: 'platform', type: 'string' },
// 			{ name: 'followed', type: 'string' },
// 			{ name: 'follower', type: 'string' },
// 			{ name: 'since', type: 'uint256' },
// 			{ name: 'recipient', type: 'address' },
// 			{ name: 'deadline', type: 'uint256' }
// 		]
// 	}

// 	// Create the message object with the provided data
// 	const message = {
// 		platform: platform.name,
// 		followed,
// 		follower,
// 		since,
// 		recipient
// 	}

// 	try {
// 		// Sign the typed data using the EIP712Signer
// 		const { signature, deadline } = await signer.signTypedData(types, message)
// 		console.log(`${platform.name} Follower Since Signature:`, signature)
// 		return { signature, deadline }
// 	} catch (error) {
// 		console.error('Error signing follower since message:', error)
// 		throw error
// 	}
// }

// /**
//  * Signs a follower-since message specifically for Instagram.
//  * @param followed - The username of the followed Instagram account.
//  * @param follower - The username of the follower Instagram account.
//  * @param since - The timestamp when the follow relationship started.
//  * @param recipient - The Ethereum address of the recipient.
//  * @returns A promise resolving to the signature and deadline.
//  */
// async function signInstagramFollowerSince(
// 	followed: string,
// 	follower: string,
// 	since: number,
// 	recipient: string
// ): Promise<{ signature: string; deadline: number }> {
// 	return signFollowerSince(instagram, followed, follower, since, recipient)
// }

// // Example usage (uncomment to run)
// // signInstagramFollowerSince(
// // 	'user123',
// // 	'follower456',
// // 	1625097600,
// // 	'0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
// // )

// export { signInstagramFollowerSince }
