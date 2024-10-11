import { EIP712Signer } from './eip712'
import { Platform, instagram } from './platforms'

async function signAccountOwnership(
	platform: Platform,
	id: string,
	recipient: string,
	deadline: number
): Promise<string> {
	const signer = new EIP712Signer(platform.ownershipContractAddress)
	const types = {
		AccountOwnership: [
			{ name: 'platform', type: 'string' },
			{ name: 'id', type: 'string' },
			{ name: 'recipient', type: 'address' },
			{ name: 'deadline', type: 'uint256' }
		]
	}

	const message = { platform: platform.name, id, recipient, deadline }

	try {
		const signature = await signer.signTypedData(types, message)
		console.log(`${platform.name} Account Ownership Signature:`, signature)
		return signature
	} catch (error) {
		console.error('Error signing account ownership message:', error)
		throw error
	}
}

async function signInstagramAccountOwnership(
	username: string,
	recipient: string,
	deadline: number
): Promise<string> {
	return signAccountOwnership(instagram, username, recipient, deadline)
}

// Uncomment to run the example
// const exampleDeadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
// signInstagramAccountOwnership('user123', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB', exampleDeadline)

export { signInstagramAccountOwnership }
