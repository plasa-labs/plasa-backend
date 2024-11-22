import InstagramService from './services/instagramService'
import StampsSignaturesService from './services/stampsService'

import { FollowerSinceStampSignature, UserResponse } from './model'

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
	 * Sets the Instagram address for a user.
	 * @param userId - The ID of the user.
	 * @param instagramUsername - The Instagram username to set.
	 * @returns A promise that resolves to the updated user data.
	 */
	async setUserInstagram(userId: string, instagramUsername: string): Promise<UserResponse | null> {
		await this.instagramService.setUserInstagram(userId, instagramUsername)

		const availableStamps = await this.stampsSignaturesService.getStampsSignatures(
			userId,
			instagramUsername
		)

		return {
			instagram_username: instagramUsername,
			address: userId,
			availableStamps
		}
	}

	/**
	 * Retrieves full data for a user, including Instagram and available stamps.
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to the user's full data.
	 */
	async getUserFullData(userId: string): Promise<UserResponse> {
		const instagram = await this.instagramService.getUserInstagram(userId)

		let availableStamps: FollowerSinceStampSignature[] | null = null

		// Check if Instagram is available and fetch stamps if so
		if (instagram) {
			availableStamps = await this.stampsSignaturesService.getStampsSignatures(userId, instagram)
		}

		return {
			instagram_username: instagram,
			address: userId,
			availableStamps
		}
	}
}

export default UserService
