import FirestoreService from '../common/firestoreService'
import StampsSignaturesService from './services/stampsService'

import { FollowerSinceStampSignature, UserResponse } from './model'

const stampsSignaturesService = new StampsSignaturesService()

/**
 * Service class for managing user-related operations.
 */
class UserService extends FirestoreService {
	/**
	 * Retrieves full data for a user, including Instagram and available stamps.
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to the user's full data.
	 */
	async getUserData(userId: string): Promise<UserResponse> {
		const userData = await this.read('users', userId)

		const instagramUsername = userData?.instagram_data?.username || null

		let availableStamps: FollowerSinceStampSignature[] | null = null

		// Check if Instagram is available and fetch stamps if so
		if (instagramUsername) {
			availableStamps = await stampsSignaturesService.getStampsSignatures(userId, instagramUsername)
		}

		return {
			instagram_username: instagramUsername,
			user_id: userId,
			available_stamps: availableStamps
		}
	}
}

export default UserService
