export interface Platform {
	name: string
	ownershipContractAddress: string
	followerSinceContractAddress: string
}

export const platforms: Record<string, Platform> = {
	instagram: {
		name: 'Instagram',
		ownershipContractAddress: '0x1234567890123456789012345678901234567890',
		followerSinceContractAddress: '0x1234567890123456789012345678901234567890'
	}
}

// Export individual platforms for convenience
export const instagram = platforms.instagram
