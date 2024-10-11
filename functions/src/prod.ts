import { onRequest } from 'firebase-functions/v2/https'
import { signInstagramAccountOwnership } from './eip712/account-ownership'
import { signInstagramFollowerSince } from './eip712/follower-since'
import { getFollowerSince } from './database/follower-since'

// Define the structure of the response object
interface InstagramUserDataResponse {
	accountOwnershipStamp?: { signature: string; deadline: number }
	isFollower?: boolean
	followerStamp?: { signature: string; deadline: number; followerSince: number }
}

/**
 * Main function to handle Instagram user data requests
 * @param request - The incoming HTTP request
 * @param response - The HTTP response object
 */
export const instagramUserData = onRequest(async (request, response) => {
	// Body parameters:
	// - instagramUsername: string - The Instagram username of the user
	// - userAddress: string - The Ethereum address of the user
	const { instagramUsername, userAddress } = request.body

	// Validate input parameters
	if (!instagramUsername || !userAddress) {
		response.status(400).json({ error: 'Missing username or userAddress' })
		return
	}

	// Initialize response object
	// Response format:
	// - accountOwnershipStamp: { signature: string, deadline: number } | undefined
	// - isFollower: boolean | undefined
	// - followerStamp: { signature: string, deadline: number, followerSince: number } | undefined
	const responseObject: InstagramUserDataResponse = {}

	try {
		// Sign account ownership
		responseObject.accountOwnershipStamp = await signInstagramAccountOwnership(
			instagramUsername,
			userAddress
		)
	} catch (error) {
		console.error('Error signing account ownership:', error)
		response.status(500).json({ error: 'Error signing account ownership' })
		return
	}

	try {
		// Check follower status and sign if applicable
		const followerData = await getFollowerSince(instagramUsername)

		if (followerData.exists) {
			responseObject.isFollower = true
			const { followerSince } = followerData

			const followerStamp = await signInstagramFollowerSince(
				process.env.FOLLOWED_USERNAME as string,
				instagramUsername,
				followerSince as number,
				userAddress
			)
			responseObject.followerStamp = {
				signature: followerStamp.signature,
				deadline: followerStamp.deadline,
				followerSince: followerSince as number
			}
		} else {
			responseObject.isFollower = false
		}

		// Send successful response
		response.status(200).json(responseObject)
	} catch (error) {
		console.error('Error checking follower status:', error)
		response.status(500).json({ error: 'Error checking follower status' })
	}
})
