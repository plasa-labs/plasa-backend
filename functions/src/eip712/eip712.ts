import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { getDeadline } from './deadline'

dotenv.config()

// Use const assertions for better type inference
const SIGNER_PRIVATE_KEY = process.env.EIP712_SIGNER_PRIVATE_KEY as string
const CHAIN_ID = parseInt(process.env.CHAIN_ID as string, 10)

/**
 * Represents the EIP-712 domain structure.
 */
interface EIP712Domain {
	name: string
	version: string
	chainId: number
	verifyingContract: string
}

/**
 * A class for handling EIP-712 signing operations.
 */
class EIP712Signer {
	private readonly domain: EIP712Domain
	private readonly signer: ethers.Wallet

	/**
	 * Creates an instance of EIP712Signer.
	 * @param verifyingContract - The address of the contract that will verify the signature.
	 */
	constructor(verifyingContract: string) {
		this.domain = {
			name: 'Plasa Stamps',
			version: '0.1.0',
			chainId: CHAIN_ID,
			verifyingContract
		}
		this.signer = new ethers.Wallet(SIGNER_PRIVATE_KEY)
	}

	/**
	 * Signs typed data according to EIP-712 standard.
	 * @param types - The type definitions for the structured data.
	 * @param message - The message to be signed.
	 * @returns An object containing the signature and the deadline.
	 */
	async signTypedData(
		types: Record<string, Array<{ name: string; type: string }>>,
		message: Record<string, unknown>
	): Promise<{ signature: string; deadline: number }> {
		const deadline = getDeadline()
		message.deadline = deadline

		const signature = await this.signer.signTypedData(this.domain, types, message)
		return { signature, deadline }
	}

	/**
	 * Gets the address of the signer.
	 */
	get signerAddress(): string {
		return this.signer.address
	}
}

export { EIP712Signer }
