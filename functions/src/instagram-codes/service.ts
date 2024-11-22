import FirestoreService from '../common/firestoreService'
import {
	FirestoreInstagramCode,
	ManyChatInstagramUser,
	ManyChatInstagramCodeResponse,
	InstagramCodeStatus
} from './model'

import { FirestoreInstagramUserData } from '../user/model'

class InstagramCodesService extends FirestoreService {
	private readonly CODES_COLLECTION_NAME = 'instagram-codes'
	private readonly USER_DATA_COLLECTION_NAME = 'users'

	private readonly CODE_VALIDITY = 10 * 60 * 1000 // minutes -> milliseconds

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
	 * Generates a random 6-digit code.
	 * @returns A random 6-digit code.
	 */
	private readonly getRandomCode = (): number => {
		return Math.floor(100000 + Math.random() * 900000)
	}

	/**
	 * Generates a random code that is guaranteed to be usable.
	 * Will keep generating new codes until a usable one is found.
	 * @returns A promise that resolves to a usable code number
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
