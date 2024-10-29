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
		return userData?.instagram || null
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
		// Update the user's Instagram address
		return this.write('users', userId, { instagram: instagramUsername })
	}
}

export default InstagramService
