import { EIP712Signer } from './eip712'
import { Platform, instagram } from './platforms'

async function signFollowerSince(
	platform: Platform,
	followed: string,
	follower: string,
	since: number,
	recipient: string
): Promise<string> {
	const signer = new EIP712Signer(platform.followerSinceContractAddress)
	const types = {
		FollowerSince: [
			{ name: 'platform', type: 'string' },
			{ name: 'followed', type: 'string' },
			{ name: 'follower', type: 'string' },
			{ name: 'since', type: 'uint256' },
			{ name: 'recipient', type: 'address' }
		]
	}

	const message = {
		platform: platform.name,
		followed,
		follower,
		since,
		recipient
	}

	try {
		const signature = await signer.signTypedData(types, message)
		console.log(`${platform.name} Follower Since Signature:`, signature)
		return signature
	} catch (error) {
		console.error('Error signing follower since message:', error)
		throw error
	}
}

async function signInstagramFollowerSince(
	followed: string,
	follower: string,
	since: number,
	recipient: string
): Promise<string> {
	return signFollowerSince(instagram, followed, follower, since, recipient)
}

// Uncomment to run the example
// signInstagramFollowerSince(
// 	'user123',
// 	'follower456',
// 	1625097600,
// 	'0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
// )

export { signInstagramFollowerSince }
