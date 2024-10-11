import { EIP712Signer } from './eip712'
import { Platform, instagram } from './platforms'

async function signAccountOwnership(
	platform: Platform,
	id: string,
	recipient: string
): Promise<string> {
	const signer = new EIP712Signer(platform.ownershipContractAddress)
	const types = {
		AccountOwnership: [
			{ name: 'platform', type: 'string' },
			{ name: 'id', type: 'string' },
			{ name: 'recipient', type: 'address' }
		]
	}

	const message = { platform: platform.name, id, recipient }

	try {
		const signature = await signer.signTypedData(types, message)
		console.log(`${platform.name} Account Ownership Signature:`, signature)
		return signature
	} catch (error) {
		console.error('Error signing account ownership message:', error)
		throw error
	}
}

async function signInstagramAccountOwnership(username: string, recipient: string): Promise<string> {
	return signAccountOwnership(instagram, username, recipient)
}

// Uncomment to run the example
// signInstagramAccountOwnership('user123', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB')

export { signInstagramAccountOwnership }