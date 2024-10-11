import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { getDeadline } from './deadline'

dotenv.config()

const signerPrivateKey = process.env.EIP712_SIGNER_PRIVATE_KEY!
console.log('signerPrivateKey', signerPrivateKey)
const chainId = parseInt(process.env.CHAIN_ID!)

interface EIP712Domain {
	name: string
	version: string
	chainId: number
	verifyingContract: string
}

class EIP712Signer {
	private domain: EIP712Domain
	private signer: ethers.Wallet

	constructor(verifyingContract: string) {
		this.domain = {
			name: 'Plasa Stamps',
			version: '0.1.0',
			chainId: chainId,
			verifyingContract: verifyingContract
		}
		this.signer = new ethers.Wallet(signerPrivateKey)
	}

	async signTypedData(
		types: Record<string, Array<{ name: string; type: string }>>,
		message: Record<string, unknown>
	): Promise<{ signature: string; deadline: number }> {
		const deadline = getDeadline()
		message.deadline = deadline

		const signature = await this.signer.signTypedData(this.domain, types, message)
		return { signature, deadline }
	}

	get signerAddress(): string {
		return this.signer.address
	}
}

export { EIP712Signer }
