import { ethers } from 'ethers'
import { config } from 'dotenv'
import { getDeadline } from './deadline'
import { Stamp } from '../database/stamps'
// Load environment variables from .env file
config()

// Use const assertions for better type inference
const SIGNER_PRIVATE_KEY = process.env.EIP712_SIGNER_PRIVATE_KEY as string

/**
 * A class for handling EIP-712 signing operations.
 * This class provides methods to sign structured data according to the EIP-712 standard.
 */
class EIP712Signer {
	private readonly signer: ethers.Wallet
	private readonly deadline: number

	/**
	 * Creates an instance of EIP712Signer.
	 * Initializes the signer with the private key from the environment variables.
	 */
	constructor() {
		this.signer = new ethers.Wallet(SIGNER_PRIVATE_KEY)
		this.deadline = getDeadline()
	}

	/**
	 * Signs typed data according to EIP-712 standard.
	 * @param verifyingContract - The address of the contract that will verify the signature.
	 * @param types - The type definitions for the structured data.
	 * @param message - The message to be signed.
	 * @returns A promise that resolves to an object containing the signature and the deadline.
	 */
	private async signTypedData(
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

		const deadline = getDeadline()
		message.deadline = deadline

		const signature = await this.signer.signTypedData(domain, types, message)
		return { signature, deadline }
	}

	/**
	 * Signs a Stamp (FollowerSince) message.
	 * @param userAddress - The Ethereum address of the user.
	 * @param stamp - The Stamp object containing contract and platform details.
	 * @param since - The timestamp (in seconds) when the follow relationship started.
	 * @returns A promise that resolves to an object containing the signature and deadline.
	 */
	async signFollowerSinceStamp(
		userAddress: string,
		stamp: Stamp,
		since: number
	): Promise<{
		signature: string
		deadline: number
	}> {
		const types = {
			FollowerSince: [
				{ name: 'platform', type: 'string' },
				{ name: 'followed', type: 'string' },
				{ name: 'since', type: 'uint256' },
				{ name: 'recipient', type: 'address' },
				{ name: 'deadline', type: 'uint256' }
			]
		}

		const message = {
			platform: stamp.platform,
			followed: stamp.followedAccount,
			since: since,
			recipient: userAddress,
			deadline: this.deadline
		}

		const { signature, deadline } = await this.signTypedData(
			stamp.contractAddress,
			stamp.chainId,
			types,
			message
		)
		return { signature, deadline }
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
