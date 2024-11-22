import FirestoreService from '../common/firestoreService'
import {
	FirestoreInstagramCode,
	ManyChatInstagramUser,
	ManyChatInstagramCodeResponse,
	InstagramCodeStatus
} from './model'

import { FirestoreInstagramUserData } from '../user/model'

/**
 * Service class for managing Instagram verification codes.
 * Handles code generation, validation, and user registration status.
 */
class InstagramCodesService extends FirestoreService {
	private readonly CODES_COLLECTION_NAME = 'instagram-codes'
	private readonly USER_DATA_COLLECTION_NAME = 'users'

	private readonly CODE_VALIDITY = 10 * 60 * 1000 // minutes -> milliseconds

	/**
	 * Handles an Instagram user from ManyChat and manages their verification code.
	 *
	 * @param manyChatData - User data received from ManyChat
	 * @returns Promise containing the code status and details
	 *
	 * Possible status responses:
	 * - ALREADY_REGISTERED: User's Instagram ID is already registered
	 * - ACTIVE_CODE_EXISTS: User has a valid code that hasn't expired
	 * - CODE_RENEWED: User had expired codes and received a new one
	 * - FIRST_CODE: User received their first verification code
	 */
	async handleManyChatInstagramUser(
		manyChatData: ManyChatInstagramUser
	): Promise<ManyChatInstagramCodeResponse> {
		const instagramId = manyChatData.ig_id as number

		try {
			// Check if Instagram ID is already registered
			const isRegistered = await this.isInstagramIdRegistered(instagramId)

			if (isRegistered) {
				return {
					status: InstagramCodeStatus.ALREADY_REGISTERED
				}
			}

			// Check if user has any active codes
			const existingCodes = await this.queryByField(
				this.CODES_COLLECTION_NAME,
				'instagram_id',
				instagramId
			)

			// If codes exist, check if any are still valid
			if (existingCodes) {
				const validCode = existingCodes.find(
					(codeData) => !this.hasExpired(codeData as FirestoreInstagramCode)
				)

				if (validCode) {
					const code = validCode as FirestoreInstagramCode
					return {
						status: InstagramCodeStatus.ACTIVE_CODE_EXISTS,
						code: code.code,
						expires_at: code.created_at + this.CODE_VALIDITY
					}
				}
			}

			// Generate new code
			const newCode = await this.getUsableCode()

			// Convert ManyChat data to Firestore format
			const firestoreCodeData = this.convertManyChatToFirestoreData(manyChatData)

			const savedCode = await this.saveNewCode(newCode, firestoreCodeData)

			// Return appropriate status based on whether this is first code or renewal
			return {
				status: existingCodes ? InstagramCodeStatus.CODE_RENEWED : InstagramCodeStatus.FIRST_CODE,
				code: newCode,
				expires_at: savedCode.created_at + this.CODE_VALIDITY
			}
		} catch (error) {
			console.error('Error handling ManyChat Instagram user:', error)
			throw error
		}
	}

	/**
	 * Saves a new Instagram code with associated user data.
	 * @param code - The numeric code to save
	 * @param instagramData - The Instagram user data associated with the code
	 * @returns A promise that resolves to the saved code data
	 * @throws Error if the code already exists
	 */
	private async saveNewCode(
		code: number,
		instagramData: FirestoreInstagramUserData
	): Promise<FirestoreInstagramCode> {
		// // Check if code already exists
		// const existingCode = await this.querySingleByField(this.COLLECTION_NAME, 'code', code)
		// if (existingCode) {
		// 	throw new Error(`Code ${code} already exists`)
		// }

		const newCodeData: FirestoreInstagramCode = {
			code,
			created_at: Date.now(),
			instagram_id: instagramData.id,
			instagram_data: instagramData
		}

		// Save the new code
		await this.writeNew(this.CODES_COLLECTION_NAME, newCodeData)
		return newCodeData
	}

	/**
	 * Generates a random 6-digit code between 100000 and 999999.
	 * Used for creating unique verification codes for users.
	 */
	private readonly getRandomCode = (): number => {
		return Math.floor(100000 + Math.random() * 900000)
	}

	/**
	 * Attempts to generate a unique, unused verification code.
	 * Keeps generating new codes until finding one that isn't currently active.
	 *
	 * @returns Promise resolving to a unique, usable verification code
	 */
	private async getUsableCode(): Promise<number> {
		let code: number
		let isUsable = false

		do {
			code = this.getRandomCode()
			isUsable = await this.canCodeBeUsed(code)
		} while (!isUsable)

		return code
	}

	/**
	 * Checks if a specific code number can be used for a new verification.
	 * A code can be used if it either doesn't exist or all existing instances have expired.
	 *
	 * @param code - The numeric code to check
	 * @returns Promise resolving to true if the code can be used, false otherwise
	 */
	private async canCodeBeUsed(code: number): Promise<boolean> {
		// Query all instances of this code
		const existingCodes = await this.queryByField(this.CODES_COLLECTION_NAME, 'code', code)

		// If no codes exist, it can be used
		if (!existingCodes) {
			return true
		}

		// Check if all existing codes have expired
		const hasValidCode = existingCodes.some(
			(codeData) => !this.hasExpired(codeData as FirestoreInstagramCode)
		)

		// Code can be used if all existing instances have expired
		return !hasValidCode
	}

	/**
	 * Checks if a code has expired.
	 * @param code - The code to check.
	 * @returns True if the code has expired, false otherwise.
	 */
	private hasExpired(code: FirestoreInstagramCode): boolean {
		return Date.now() - code.created_at > this.CODE_VALIDITY
	}

	/**
	 * Converts ManyChat Instagram user data to Firestore Instagram user data format.
	 * @param manyChatData - The ManyChat Instagram user data to convert
	 * @returns The converted Firestore Instagram user data
	 */
	private convertManyChatToFirestoreData(
		manyChatData: ManyChatInstagramUser
	): FirestoreInstagramUserData {
		return {
			id: manyChatData.ig_id,
			username: manyChatData.ig_username,
			name: manyChatData.name,
			first_name: manyChatData.first_name,
			last_name: manyChatData.last_name,
			profile_pic: manyChatData.profile_pic
		}
	}

	/**
	 * Checks if an Instagram ID has already been registered by any user.
	 * @param instagramId - The Instagram ID to check
	 * @returns A promise that resolves to true if the ID is already registered, false otherwise
	 */
	private async isInstagramIdRegistered(instagramId: number): Promise<boolean> {
		const existingUsers = await this.querySingleByField(
			this.USER_DATA_COLLECTION_NAME,
			'instagram_id',
			instagramId
		)

		return existingUsers !== null
	}
}

export default InstagramCodesService
