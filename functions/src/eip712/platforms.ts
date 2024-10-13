/**
 * Represents a social media platform with ownership contract information.
 */
export interface Platform {
	/** The name of the social media platform */
	name: string
	/** The Ethereum address of the ownership contract for this platform */
	ownershipContractAddress: string
}

/**
 * A record of supported social media platforms and their contract addresses.
 * This object maps platform identifiers to their respective Platform configurations.
 */
export const platforms: Record<string, Platform> = {
	instagram: {
		name: 'Instagram',
		ownershipContractAddress: '0x0000000000000000000000000000000000000000'
	} as const
}

/**
 * Instagram platform configuration.
 * This constant provides easy access to the Instagram platform settings.
 */
export const instagram = platforms.instagram
