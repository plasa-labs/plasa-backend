/**
 * Represents a stamp indicating when a user started following an account.
 */
export interface FollowerSinceStamp {
	/** The contract address associated with the stamp. */
	contractAddress: string
	/** The blockchain chain ID. */
	chainId: number
	/** The platform where the following occurred (e.g., Instagram, Twitter). */
	platform: string
	/** The account that is being followed. */
	followedAccount: string
}

/**
 * Represents a signature for a FollowerSinceStamp, including metadata.
 */
export interface FollowerSinceStampSignature {
	/** The cryptographic signature verifying the stamp. */
	signature: string
	/** The deadline timestamp for the signature's validity. */
	deadline: number
	/** The timestamp indicating when the following started. */
	since: number
	/** The actual stamp data. */
	stamp: FollowerSinceStamp
	/** Indicates if the signature is authentic. Mock signatures can be generated for testing. */
	authentic: boolean
}

/**
 * Represents the full data of a user, including optional social media and stamps.
 */
export interface UserFullData {
	/** The user's blockchain address. */
	address: string
	/** The user's Instagram handle, if available. */
	instagram?: string | null
	/** A list of available follower stamps, if any. */
	availableStamps?: FollowerSinceStampSignature[] | null
}
