import InstagramCodesCommonService from './common/instagramCommonService'
import {
	InstagramCodeStatus,
	ManyChatInstagramUser,
	ManyChatMessageResponse,
	FirestoreInstagramCode,
	CodeResponseData
} from '../model'
import { FirestoreInstagramUserData } from '../../user/model'

/**
 * Service for handling Instagram verification code generation.
 */
class InstagramCodesGenerationService extends InstagramCodesCommonService {
	async getCodeMessage(manyChatData: ManyChatInstagramUser): Promise<ManyChatMessageResponse> {
		const codeResponseData = await this.codeResponseData(manyChatData)
		return this.createManyChatResponse(codeResponseData)
	}

	/**
	 * Handles an Instagram user from ManyChat and manages their verification code.
	 */
	private async codeResponseData(manyChatData: ManyChatInstagramUser): Promise<CodeResponseData> {
		const instagramId = manyChatData.ig_id

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
			const firestoreCodeData = this.convertManyChatToFirestoreData(manyChatData)
			const savedCode = await this.saveNewCode(newCode, firestoreCodeData)

			return {
				status: InstagramCodeStatus.FIRST_CODE,
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

	private createManyChatResponse(code: CodeResponseData): ManyChatMessageResponse {
		let message = ''

		if (code.status === InstagramCodeStatus.ALREADY_REGISTERED) {
			message = 'Tu cuenta de Instagram ya está vinculada a una cuenta de la plataforma.'
		} else {
			const formattedCode = String(code.code).replace(/(\d{3})(\d{3})/, '$1 $2')
			const expiryDate = this.formatDateTime(code.expires_at!)
			message = `Código de verificación: ${formattedCode}\n\nVálido hasta: ${expiryDate} hs. (UTC-3 Argentina)`
		}

		return {
			version: 'v2',
			content: {
				type: 'instagram',
				messages: [{ type: 'text', text: message }]
			}
		}
	}

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

	private readonly getRandomCode = (): number => {
		return Math.floor(100000 + Math.random() * 900000)
	}

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
		const existingCodes = await this.queryByField(this.CODES_COLLECTION_NAME, 'code', code)
		if (!existingCodes) return true

		const hasValidCode = existingCodes.some(
			(codeData) => !this.hasExpired(codeData as FirestoreInstagramCode)
		)
		return !hasValidCode
	}
}

export default InstagramCodesGenerationService
