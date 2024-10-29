import { ethers } from 'ethers'
import { config } from 'dotenv'

config()

// Load and validate environment variables
const SIGNER_PRIVATE_KEY = process.env.EIP712_SIGNER_PRIVATE_KEY
if (!SIGNER_PRIVATE_KEY) {
	throw new Error('EIP712_SIGNER_PRIVATE_KEY environment variable must be set')
}

const EIP712_DEADLINE_MINUTES = process.env.EIP712_DEADLINE_MINUTES
if (!EIP712_DEADLINE_MINUTES || isNaN(Number(EIP712_DEADLINE_MINUTES))) {
	throw new Error('EIP712_DEADLINE_MINUTES environment variable must be set to a valid number')
}

/**
 * Handles EIP-712 signing operations.
 * Provides methods to sign structured data as per the EIP-712 standard.
 */
class SignatureService {
	private readonly signer: ethers.Wallet
	private readonly deadline: number

	/**
	 * Initializes the signer using the private key from environment variables.
	 */
	constructor() {
		this.signer = new ethers.Wallet(SIGNER_PRIVATE_KEY as string)
		this.deadline = getDeadline()
	}

	/**
	 * Signs structured data according to the EIP-712 standard.
	 * @param verifyingContract - Contract address for signature verification.
	 * @param chainId - The chain ID of the Ethereum network.
	 * @param types - Type definitions for the structured data.
	 * @param message - The message to be signed.
	 * @returns A promise resolving to an object with the signature and deadline.
	 */
	async signTypedData(
		verifyingContract: string,
		chainId: number,
		types: Record<string, Array<{ name: string; type: string }>>,
		message: Record<string, unknown>
	): Promise<{ signature: string; deadline: number }> {
		const domain: ethers.TypedDataDomain = {
			name: 'Plasa Stamps',
			version: '0.1.0',
			chainId: chainId,
			verifyingContract: verifyingContract
		}

		// Include the deadline in the message
		message.deadline = this.deadline

		const signature = await this.signer.signTypedData(domain, types, message)

		return { signature, deadline: this.deadline }
	}

	/**
	 * Retrieves the Ethereum address of the signer.
	 * @returns The signer's Ethereum address.
	 */
	get signerAddress(): string {
		return this.signer.address
	}
}

/**
 * Computes the deadline timestamp for EIP-712 signatures.
 * Adds the duration from EIP712_DEADLINE_MINUTES to the current timestamp.
 * @returns {number} The deadline timestamp in seconds since the Unix epoch.
 */
function getDeadline(): number {
	// Get the current timestamp in seconds
	const currentTimestamp: number = Math.floor(Date.now() / 1000)

	// Calculate the deadline by adding the duration to the current timestamp
	return currentTimestamp + Number(EIP712_DEADLINE_MINUTES) * 60
}

export { SignatureService }
