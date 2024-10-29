import InstagramService from './services/instagramService'
import StampsSignaturesService from './services/stampsService'

import { FollowerSinceStampSignature, UserFullData } from './model'

/**
 * Service class for managing user-related operations.
 */
class UserService {
	private instagramService: InstagramService
	private stampsSignaturesService: StampsSignaturesService

	/**
	 * Initializes the UserService with instances of InstagramService and StampsSignaturesService.
	 */
	constructor() {
		this.instagramService = new InstagramService()
		this.stampsSignaturesService = new StampsSignaturesService()
	}

	/**
	 * Retrieves the Instagram address of a user.
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to the Instagram address or null if not set.
	 */
	async getUserInstagram(userId: string): Promise<string | null> {
		return this.instagramService.getUserInstagram(userId)
	}

	/**
	 * Sets the Instagram address for a user.
	 * @param userId - The ID of the user.
	 * @param instagramUsername - The Instagram username to set.
	 * @returns A promise that resolves to the updated user data.
	 */
	async setUserInstagram(
		userId: string,
		instagramUsername: string
	): Promise<FirebaseFirestore.DocumentData> {
		return this.instagramService.setUserInstagram(userId, instagramUsername)
	}

	/**
	 * Retrieves full data for a user, including Instagram and available stamps.
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to the user's full data.
	 */
	async getUserFullData(userId: string): Promise<UserFullData> {
		const instagram = await this.getUserInstagram(userId)

		let availableStamps: FollowerSinceStampSignature[] | null = null

		// Check if Instagram is available and fetch stamps if so
		if (instagram) {
			availableStamps = await this.getAvailableInstagramStamps(userId, instagram)
		}

		return {
			instagram,
			address: userId,
			availableStamps
		}
	}

	/**
	 * Retrieves available "follower since" stamps for a user based on their Instagram username.
	 * @param userAddress - The blockchain address of the user.
	 * @param instagramUsername - The Instagram username of the user.
	 * @returns A promise that resolves to an array of FollowerSinceStampSignature objects.
	 */
	async getAvailableInstagramStamps(
		userAddress: string,
		instagramUsername: string
	): Promise<FollowerSinceStampSignature[]> {
		return this.stampsSignaturesService.getAvailableInstagramStamps(userAddress, instagramUsername)
	}
}

export default UserService
