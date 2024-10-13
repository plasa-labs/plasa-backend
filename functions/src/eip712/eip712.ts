import { ethers } from 'ethers'
import { config } from 'dotenv'
import { getDeadline } from './deadline'

// Load environment variables from .env file
config()

// Use const assertions for better type inference
const SIGNER_PRIVATE_KEY = process.env.EIP712_SIGNER_PRIVATE_KEY as string
const CHAIN_ID = parseInt(process.env.CHAIN_ID as string, 10)

/**
 * A class for handling EIP-712 signing operations.
 * This class provides methods to sign structured data according to the EIP-712 standard.
 */
class EIP712Signer {
	private readonly signer: ethers.Wallet

	/**
	 * Creates an instance of EIP712Signer.
	 * Initializes the signer with the private key from the environment variables.
	 */
	constructor() {
		this.signer = new ethers.Wallet(SIGNER_PRIVATE_KEY)
	}

	/**
	 * Signs typed data according to EIP-712 standard.
	 * @param verifyingContract - The address of the contract that will verify the signature.
	 * @param types - The type definitions for the structured data.
	 * @param message - The message to be signed.
	 * @returns A promise that resolves to an object containing the signature and the deadline.
	 */
	async signTypedData(
		verifyingContract: string,
		types: Record<string, Array<{ name: string; type: string }>>,
		message: Record<string, unknown>
	): Promise<{ signature: string; deadline: number }> {
		const domain: ethers.TypedDataDomain = {
			name: 'Plasa Stamps',
			version: '0.1.0',
			chainId: CHAIN_ID,
			verifyingContract: verifyingContract
		}

		const deadline = getDeadline()
		message.deadline = deadline

		const signature = await this.signer.signTypedData(domain, types, message)
		return { signature, deadline }
	}

	/**
	 * Signs a FollowerSince message for Instagram followers.
	 * @param verifyingContract - The address of the contract that will verify the signature.
	 * @param followed - The Instagram handle of the followed account.
	 * @param follower - The Instagram handle of the follower account.
	 * @param since - The timestamp (in seconds) when the follow relationship started.
	 * @param recipient - The Ethereum address of the recipient.
	 * @returns A promise that resolves to an object containing the signature and the deadline.
	 */
	async signFollowerSince(
		verifyingContract: string,
		followed: string,
		follower: string,
		since: number,
		recipient: string
	): Promise<{ signature: string; deadline: number }> {
		const types = {
			FollowerSince: [
				{ name: 'platform', type: 'string' },
				{ name: 'followed', type: 'string' },
				{ name: 'follower', type: 'string' },
				{ name: 'since', type: 'uint256' },
				{ name: 'recipient', type: 'address' },
				{ name: 'deadline', type: 'uint256' }
			]
		}

		const message = {
			platform: 'Instagram',
			followed,
			follower,
			since,
			recipient
		}

		return this.signTypedData(verifyingContract, types, message)
	}

	/**
	 * Gets the Ethereum address of the signer.
	 * @returns The Ethereum address of the signer as a string.
	 */
	get signerAddress(): string {
		return this.signer.address
	}
}

export { EIP712Signer }
