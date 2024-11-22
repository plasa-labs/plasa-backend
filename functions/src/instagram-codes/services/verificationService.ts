import InstagramCommonService from './common/instagramCommonService'
import { FirestoreInstagramCode, InstagramCodeVerificationStatus } from '../model'

/**
 * Service for handling Instagram verification code validation.
 * Extends InstagramCommonService to provide code verification functionality.
 */
class InstagramVerificationService extends InstagramCommonService {
	/**
	 * Verifies a code for a given user address and links Instagram account if valid.
	 * @param userId - The unique identifier of the user
	 * @param code - The verification code to validate
	 * @returns Promise<CodeVerificationStatus> - Result of the verification process
	 * @throws Error if verification process fails
	 */
	async verifyCode(userId: string, code: number): Promise<InstagramCodeVerificationStatus> {
		try {
			// Check if user already has an Instagram link
			const existingUserData = await this.read(this.USER_DATA_COLLECTION_NAME, userId)
			if (existingUserData?.instagram_id) {
				return InstagramCodeVerificationStatus.USER_ALREADY_LINKED
			}

			const codeSnapshot = await this.queryByFieldSnapshot(this.CODES_COLLECTION_NAME, 'code', code)

			if (!codeSnapshot) {
				return InstagramCodeVerificationStatus.INVALID_CODE
			}

			const activeCode = codeSnapshot.docs.find(
				(data) => !this.hasExpired(data.data() as FirestoreInstagramCode)
			)

			if (!activeCode) {
				return InstagramCodeVerificationStatus.EXPIRED_CODE
			}

			const activeCodeData = activeCode!.data() as FirestoreInstagramCode

			if (activeCodeData.used) {
				return InstagramCodeVerificationStatus.USED_CODE
			}

			const isRegistered = await this.isInstagramIdRegistered(activeCodeData.instagram_id)
			if (isRegistered) {
				return InstagramCodeVerificationStatus.INSTAGRAM_ALREADY_LINKED
			}

			// Register the Instagram ID with the user address
			await this.linkInstagram(userId, activeCode)

			return InstagramCodeVerificationStatus.SUCCESS
		} catch (error) {
			console.error('Error verifying code:', error)
			throw error
		}
	}

	/**
	 * Links an Instagram account to a user and marks the verification code as used.
	 * @param userId - The unique identifier of the user
	 * @param codeDoc - Firestore document snapshot containing the verification code data
	 * @throws Error if linking process fails
	 * @private
	 */
	private async linkInstagram(
		userId: string,
		codeDoc: FirebaseFirestore.DocumentSnapshot
	): Promise<void> {
		try {
			await this.writeFromRef(codeDoc.ref, {
				used: true
			})
		} catch (error) {
			console.error('Error updating code as used:', error)
			throw error
		}

		try {
			const codeData = codeDoc.data() as FirestoreInstagramCode

			// Link Instagram to user
			await this.write(this.USER_DATA_COLLECTION_NAME, userId, {
				instagram_id: codeData.instagram_id,
				instagram_data: codeData.instagram_data
			})
		} catch (error) {
			console.error('Error linking Instagram to user:', error)
			throw error
		}
	}
}

export default InstagramVerificationService
