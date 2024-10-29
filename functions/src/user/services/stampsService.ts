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
	async getAvailableInstagramStamps(
		userAddress: string,
		instagramUsername: string
	): Promise<FollowerSinceStampSignature[]> {
		if (!instagramUsername) {
			throw new Error('Instagram username is required')
		}

		// Fetch all existing Instagram stamps
		const stamps = await this.getAllInstagramStamps()

		// Check follower since data for each stamp and generate signatures
		const availableStamps: (FollowerSinceStampSignature | null)[] = await Promise.all(
			stamps.map(async (stamp) => {
				let authentic = true

				// Retrieve the 'follower since' timestamp
				let since = await this.getFollowerSince(
					stamp.platform,
					stamp.followedAccount,
					instagramUsername
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

		// Filter out null values and return the available stamps
		return availableStamps.filter((stamp) => stamp !== null) as FollowerSinceStampSignature[]
	}

	/**
	 * Fetches all Instagram stamps from the database.
	 * @returns A promise that resolves to an array of FollowerSinceStamp objects.
	 * @throws Will throw an error if no Instagram stamps are found or if there's a database error.
	 */
	private async getAllInstagramStamps(): Promise<FollowerSinceStamp[]> {
		try {
			// Query Firestore for documents where the platform is 'instagram'
			const stampsData = await firestoreService.queryByField(
				'follower-since-stamps',
				'platform',
				'instagram'
			)
			if (!stampsData) {
				throw new Error('No Instagram stamps found')
			}
			return stampsData.map((data) => data as FollowerSinceStamp)
		} catch (error) {
			console.error('Error fetching Instagram stamps:', error)
			throw new Error('Failed to retrieve Instagram stamps')
		}
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
		const collectionName = `${platform}-${followedAccount}`
		const documentData = await firestoreService.querySingleByField(
			collectionName,
			'followerAccount',
			followerAccount
		)

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
