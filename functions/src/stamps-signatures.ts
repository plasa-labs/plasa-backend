import { EIP712Signer } from './eip712/signer'
import { checkInstagramFollowerSince } from './follower-since'
import { StampSignature } from './return-interfaces'
import { Stamp } from './database/stamps'

/**
 * Generates signatures for Instagram follower stamps.
 *
 * @param instagramUsername - The Instagram username of the follower.
 * @param stampContractAddresses - An optional array of stamp contract addresses.
 * @returns A Promise that resolves to an array of StampSignature objects.
 */
async function generateInstagramStampSignatures(
	userAddress: string,
	instagramUsername: string,
	stamps: Stamp[]
): Promise<StampSignature[]> {
	try {
		// Generate a signer
		const signer = new EIP712Signer()

		// Generate signatures for each stamp
		const stampSignatures: StampSignature[] = await Promise.all(
			stamps.map(async (stamp) => {
				// Get follower since data
				const { since, authentic } = await checkInstagramFollowerSince(
					instagramUsername,
					stamp.followedAccount
				)

				// Generate signature
				const { signature, deadline } = await signer.signFollowerSinceStamp(
					userAddress,
					stamp,
					since
				)

				return {
					signature,
					deadline,
					since,
					stamp,
					authentic
				}
			})
		)

		return stampSignatures
	} catch (error) {
		console.error('Error generating Instagram stamp signatures:', error)
		throw new Error('Failed to generate Instagram stamp signatures')
	}
}

export { generateInstagramStampSignatures }
