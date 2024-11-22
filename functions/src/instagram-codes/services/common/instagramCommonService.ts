import FirestoreService from '../../../common/firestoreService'
import { FirestoreInstagramCode, ManyChatInstagramRequest } from '../../model'
import { FirestoreInstagramUserData } from '../../../user/model'

/**
 * Base service class for Instagram code operations.
 * Contains common functionality used by both generation and verification services.
 */
class InstagramCodesCommonService extends FirestoreService {
	protected readonly CODES_COLLECTION_NAME = 'instagram-codes'
	protected readonly USER_DATA_COLLECTION_NAME = 'users'

	protected static readonly MINUTES_IN_MS = 60 * 1000
	protected readonly CODE_VALIDITY = 10 * InstagramCodesCommonService.MINUTES_IN_MS

	/**
	 * Checks if a code has expired.
	 */
	protected hasExpired(code: FirestoreInstagramCode): boolean {
		return Date.now() > this.expirationDate(code.created_at)
	}

	/**
	 * Calculates the expiration date for a code.
	 */
	protected expirationDate(created_at: number): number {
		return created_at + this.CODE_VALIDITY
	}

	/**
	 * Formats a date for display in Argentina timezone.
	 */
	protected formatDateTime(timestamp: number): string {
		const date = new Date(timestamp)
		return date.toLocaleString('es-AR', {
			timeZone: 'America/Argentina/Buenos_Aires',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	/**
	 * Checks if an Instagram ID is already registered.
	 */
	protected async isInstagramIdRegistered(instagramId: number): Promise<boolean> {
		const existingUsers = await this.querySingleByField(
			this.USER_DATA_COLLECTION_NAME,
			'instagram_id',
			instagramId
		)
		return existingUsers !== null
	}

	/**
	 * Converts ManyChat data to Firestore format.
	 */
	protected convertManyChatToFirestoreData(
		manyChatData: ManyChatInstagramRequest
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
}

export default InstagramCodesCommonService
