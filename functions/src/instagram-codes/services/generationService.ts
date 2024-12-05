import InstagramCodesCommonService from './common/instagramCommonService'
import {
	InstagramCodeGenerationStatus,
	ManyChatInstagramRequest,
	ManyChatMessageResponse,
	FirestoreInstagramCode,
	InstagramCodeGenerationResult
} from '../model'
import { FirestoreInstagramUserData } from '../../user/model'

/**
 * Service for handling Instagram verification code generation.
 * Manages the creation, validation, and storage of verification codes for Instagram users.
 */
class InstagramCodesGenerationService extends InstagramCodesCommonService {
	/**
	 * Generates a message containing a verification code for a ManyChat Instagram user.
	 * @param manyChatData - The Instagram user data from ManyChat
	 * @returns A formatted message response for ManyChat
	 */
	async getCodeMessage(manyChatData: ManyChatInstagramRequest): Promise<ManyChatMessageResponse> {
		const codeResponseData = await this.codeResponseData(manyChatData)
		return this.createManyChatResponse(codeResponseData)
	}

	/**
	 * Processes an Instagram user's verification code request.
	 * - Checks if the user is already registered
	 * - Validates existing codes
	 * - Generates new codes when needed
	 *
	 * @param manyChatData - The Instagram user data from ManyChat
	 * @returns Code response data containing status and code information
	 * @throws Error if processing fails
	 */
	private async codeResponseData(
		manyChatData: ManyChatInstagramRequest
	): Promise<InstagramCodeGenerationResult> {
		const instagramId = manyChatData.ig_id

		try {
			// Check if Instagram ID is already registered
			const isRegistered = await this.isInstagramIdRegistered(instagramId)
			if (isRegistered) {
				return {
					status: InstagramCodeGenerationStatus.ALREADY_REGISTERED
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
						status: InstagramCodeGenerationStatus.ACTIVE_CODE_EXISTS,
						code: code.code,
						expires_at: code.created_at + this.CODE_VALIDITY
					}
				}
			}

			// Generate new code
			const newCode = await this.getUsableCode()
			const firestoreCodeData = this.convertManyChatToFirestoreData(manyChatData)
			const savedCode = await this.saveNewCode(newCode, firestoreCodeData)

			return {
				status: InstagramCodeGenerationStatus.FIRST_CODE,
				code: newCode,
				expires_at: savedCode.created_at + this.CODE_VALIDITY
			}
		} catch (error) {
			console.error('Error handling ManyChat Instagram user:', error)
			if (error instanceof Error) {
				throw new Error(`Failed to handle Instagram user: ${error.message}`)
			}
			throw new Error('Failed to handle Instagram user: Unknown error')
		}
	}

	/**
	 * Creates a formatted ManyChat response message based on the code status.
	 * @param code - The code response data containing status and verification details
	 * @returns Formatted ManyChat message response
	 */
	private createManyChatResponse(code: InstagramCodeGenerationResult): ManyChatMessageResponse {
		let message = ''

		if (code.status === InstagramCodeGenerationStatus.ALREADY_REGISTERED) {
			message = 'Tu cuenta de Instagram ya está vinculada a una cuenta de la plataforma.'
		} else {
			const formattedCode = String(code.code).replace(/(\d{3})(\d{3})/, '$1 $2')
			const expiryDate = this.formatDateTime(code.expires_at!)
			message = `Para vincular tu cuenta de Instagram, podés ingresar al siguiente link: https://alpha.ddfundacion.org/onboarding?code=${code.code}\n\nO ingresar manualmente el siguiente código de verificación: ${formattedCode}\n\nVálido hasta: ${expiryDate} hs. (UTC-3 Argentina)`
		}

		return {
			version: 'v2',
			content: {
				type: 'instagram',
				messages: [{ type: 'text', text: message }]
			}
		}
	}

	/**
	 * Saves a new verification code to Firestore.
	 * @param code - The numeric verification code
	 * @param instagramData - The Instagram user data to associate with the code
	 * @returns The saved code data with timestamp
	 */
	private async saveNewCode(
		code: number,
		instagramData: FirestoreInstagramUserData
	): Promise<FirestoreInstagramCode> {
		const newCodeData: FirestoreInstagramCode = {
			code,
			created_at: Date.now(),
			used: false,
			instagram_id: instagramData.id,
			instagram_data: instagramData
		}

		await this.writeNew(this.CODES_COLLECTION_NAME, newCodeData)
		return newCodeData
	}

	/**
	 * Generates a random 6-digit verification code.
	 * @returns A number between 100000 and 999999
	 */
	private readonly getRandomCode = (): number => {
		return Math.floor(100000 + Math.random() * 900000)
	}

	/**
	 * Generates a unique verification code that hasn't been used or hasn't expired.
	 * @returns A usable verification code
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
	 * Checks if a verification code can be used by verifying it doesn't exist or has expired.
	 * @param code - The verification code to check
	 * @returns True if the code can be used, false otherwise
	 */
	private async canCodeBeUsed(code: number): Promise<boolean> {
		const existingCodes = await this.queryByField(this.CODES_COLLECTION_NAME, 'code', code)
		if (!existingCodes) return true

		const hasValidCode = existingCodes.some(
			(codeData) => !this.hasExpired(codeData as FirestoreInstagramCode)
		)
		return !hasValidCode
	}
}

export default InstagramCodesGenerationService
