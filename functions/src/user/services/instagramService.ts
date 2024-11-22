import FirestoreService from '../../common/firestoreService'

class InstagramService extends FirestoreService {
	/**
	 * Retrieves the Instagram address of a user.
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to the Instagram address or null if not set.
	 */
	async getUserInstagram(userId: string): Promise<string | null> {
		const userData = await this.read('users', userId)
		// Return the Instagram address if it exists, otherwise return null
		return userData?.instagram_data?.username || null
	}

	/**
	 * Sets the Instagram address for a user.
	 * @param userId - The ID of the user.
	 * @param instagramUsername - The Instagram username to set.
	 * @returns A promise that resolves to the updated user data or null if the username is not unique.
	 */
	async setUserInstagram(
		userId: string,
		instagramUsername: string
	): Promise<FirebaseFirestore.DocumentData | null> {
		// Ensure the Instagram username is unique before setting it
		try {
			return await this.setUniqueField('users', userId, 'instagram', instagramUsername)
		} catch (error) {
			console.error('Error setting unique Instagram username:', error)
			return null
		}
	}
}

export default InstagramService
