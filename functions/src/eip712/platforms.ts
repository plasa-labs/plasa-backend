/**
 * Represents a social media platform with ownership and follower contracts.
 */
export interface Platform {
	name: string
	ownershipContractAddress: string
	followerSinceContractAddress: string
}

/**
 * A record of supported platforms and their contract addresses.
 */
export const platforms: Record<string, Platform> = {
	instagram: {
		name: 'Instagram',
		ownershipContractAddress: '0x1234567890123456789012345678901234567890',
		followerSinceContractAddress: '0x1234567890123456789012345678901234567890'
	} as const
}

// Export individual platforms for convenience
/**
 * Instagram platform configuration.
 */
export const instagram = platforms.instagram
