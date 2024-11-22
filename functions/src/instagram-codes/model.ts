import { FirestoreInstagramUserData } from '../user/model'

export interface ManyChatInstagramUser {
	key: string
	id: string
	page_id: string
	user_refs: string[]
	status: 'active' | string
	first_name: string
	last_name: string
	name: string
	gender: string | null
	profile_pic: string
	locale: string | null
	language: string | null
	timezone: string
	live_chat_url: string
	last_input_text: string
	optin_phone: boolean
	phone: string | null
	optin_email: boolean
	email: string | null
	subscribed: string // ISO 8601 date string
	last_interaction: string | null
	ig_last_interaction: string // ISO 8601 date string
	last_seen: string | null
	ig_last_seen: string // ISO 8601 date string
	is_followup_enabled: boolean
	ig_username: string
	ig_id: number
	whatsapp_phone: string | null
	optin_whatsapp: boolean
	phone_country_code: string | null
	last_growth_tool: string | null
	custom_fields: Record<string, unknown>
}

export interface FirestoreInstagramCode {
	code: number
	created_at: number
	used: boolean
	instagram_id: number
	instagram_data: FirestoreInstagramUserData
}

export enum InstagramCodeStatus {
	ALREADY_REGISTERED = 'ALREADY_REGISTERED', // User's Instagram ID is already in the system
	ACTIVE_CODE_EXISTS = 'ACTIVE_CODE_EXISTS', // User has a valid, non-expired code
	FIRST_CODE = 'FIRST_CODE', // First time user requesting a code
	CODE_RENEWED = 'CODE_RENEWED' // Previous code expired, new code generated
}

export interface CodeResponseData {
	status: InstagramCodeStatus
	code?: number
	expires_at?: number
}

export interface ManyChatMessageResponse {
	version: 'v2'
	content: {
		type: 'instagram'
		messages: Array<{
			type: 'text'
			text: string
		}>
	}
}

export enum CodeVerificationStatus {
	INVALID_CODE = 'Invalid code',
	EXPIRED_CODE = 'Code expired',
	USED_CODE = 'Code already used',
	INSTAGRAM_ALREADY_LINKED = 'Instagram already linked',
	USER_ALREADY_LINKED = 'User already linked',
	SUCCESS = 'Success'
}

export interface CodeVerificationResult {
	status: CodeVerificationStatus
	instagramData?: FirestoreInstagramUserData
	instagramId?: number
	userId?: string
}
