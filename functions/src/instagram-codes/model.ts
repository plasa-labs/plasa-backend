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

export interface FirestoreInstagramUserData {
	id: number
	username: string
	name: string
	first_name: string
	last_name: string
	profile_pic: string
}

export interface FirestoreInstagramCode {
	code: number
	created_at: string
	instagram_id: number
	instagram_data: FirestoreInstagramUserData
}
