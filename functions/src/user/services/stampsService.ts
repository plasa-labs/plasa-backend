import FirestoreService from '../../common/firestoreService'
import SignatureService from '../../common/signatureService'

import { FollowerSinceStamp, FollowerSinceStampSignature } from '../model'

// Initialize FirestoreService instance
const firestoreService = new FirestoreService()

/**
 * Service for handling operations related to Instagram "follower since" stamps and their signatures.
 */
class StampsSignaturesService {
	private signatureService = new SignatureService()

	/**
	 * Retrieves available "follower since" stamps for a user based on their Instagram username.
	 * @param userAddress - The blockchain address of the user.
	 * @param instagramUsername - The Instagram username of the user.
	 * @returns A promise that resolves to an array of FollowerSinceStampSignature objects.
	 * @throws Will throw an error if the Instagram username is not provided.
	 */
	async getStampsSignatures(
		userAddress: string,
		instagramUsername: string
	): Promise<FollowerSinceStampSignature[]> {
		if (!instagramUsername) {
			throw new Error('Instagram username is required')
		}

		const instagramStamps = await this.getInstagramStamps()

		// Check follower since data for each stamp and generate signatures
		const signatures = await this.stampsToSignatures(
			instagramStamps,
			userAddress,
			instagramUsername
		)

		// Filter out null values and return the available stamps
		return signatures
	}

	/**
	 * Fetches all Instagram stamps from the database.
	 * @returns A promise that resolves to an array of FollowerSinceStamp objects.
	 * @throws Will throw an error if no Instagram stamps are found or if there's a database error.
	 */
	private async getInstagramStamps(): Promise<FollowerSinceStamp[]> {
		try {
			const instagramStamps = await firestoreService.queryByFields('stamps', {
				platform: 'Instagram',
				type: 'follower-since'
			})

			if (!instagramStamps) {
				throw new Error('No Instagram stamps found')
			}

			return instagramStamps.map((data) => data as FollowerSinceStamp)
		} catch (error) {
			console.error('Error fetching Instagram stamps:', error)
			throw new Error('Failed to retrieve Instagram stamps')
		}
	}

	private async stampsToSignatures(
		stamps: FollowerSinceStamp[],
		userAddress: string,
		instagramUsername: string
	): Promise<FollowerSinceStampSignature[]> {
		// Check follower since data for each stamp and generate signatures
		const signatures: FollowerSinceStampSignature[] = await Promise.all(
			stamps.map(async (stamp) => {
				let authentic = true

				// Retrieve the 'follower since' timestamp
				let since = await this.getFollowerSince(
					stamp.platform,
					instagramUsername,
					stamp.followedAccount
				)

				// If no timestamp is found, generate a random one
				if (!since) {
					since = this.generateRandomFollowerSince()
					authentic = false
				}

				// Generate a signature for the follower since data
				const { signature, deadline } = await this.getFollowerSinceSignature(
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
		return signatures
	}

	/**
	 * Retrieves the 'follower since' timestamp for a given follower and followed account.
	 * @param platform - The platform of the account (e.g., Instagram).
	 * @param followerAccount - The Instagram username of the follower.
	 * @param followedAccount - The Instagram username of the followed account.
	 * @returns A promise that resolves to the timestamp when the follow relationship started, or null if not found.
	 */
	private async getFollowerSince(
		platform: string,
		followerAccount: string,
		followedAccount: string
	): Promise<number | null> {
		// const collectionName = `${platform}-${followedAccount}`
		const collectionName = followedAccount
		const documentData = await firestoreService.read(collectionName, followerAccount)

		// Return the 'follower since' timestamp if available
		return documentData ? documentData.follower_since || null : null
	}

	/**
	 * Generates a signature for the 'follower since' data.
	 * @param userAddress - The blockchain address of the user.
	 * @param stamp - The stamp object containing platform and account information.
	 * @param since - The timestamp of when the follow relationship started.
	 * @returns A promise that resolves to an object containing the signature and deadline.
	 */
	private async getFollowerSinceSignature(
		userAddress: string,
		stamp: FollowerSinceStamp,
		since: number
	): Promise<{ signature: string; deadline: number }> {
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
			recipient: userAddress
		}

		// Use SignatureService to sign the typed data
		const { signature, deadline } = await this.signatureService.signTypedData(
			stamp.contractAddress,
			stamp.chainId,
			types,
			message
		)

		return { signature, deadline }
	}

	/**
	 * Generates a random Unix timestamp representing a follower's "since" date.
	 * The date will be between June 12, 2024, and the current date.
	 * @returns A random Unix timestamp.
	 */
	private generateRandomFollowerSince(): number {
		const JUNE_12_2024 = 1718236800 // Unix timestamp for June 12, 2024
		const now = Math.floor(Date.now() / 1000) // Current Unix timestamp

		// Generate a random timestamp between June 12, 2024, and now
		return JUNE_12_2024 + Math.floor(Math.random() * (now - JUNE_12_2024))
	}
}

export default StampsSignaturesService
