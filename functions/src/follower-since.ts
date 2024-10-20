import { getFollowerSince } from './database/follower-since'
import { generateRandomFollowerSince } from './utils/random'

interface FollowerSinceResponse {
	since: number
	authentic: boolean
}

/**
 * Checks the follower since date for an Instagram user and a followed account.
 *
 * @param followerUsername - The username of the follower.
 * @param followedAccount - The username of the followed account.
 * @returns A Promise that resolves to an object containing the follower since date and authenticity.
 */
async function checkInstagramFollowerSince(
	followerUsername: string,
	followedAccount: string
): Promise<FollowerSinceResponse> {
	try {
		const since = await getFollowerSince(followerUsername, followedAccount)

		if (since !== null) {
			return {
				since,
				authentic: true
			}
		} else {
			return {
				since: generateRandomFollowerSince(),
				authentic: false
			}
		}
	} catch (error) {
		console.error('Error checking Instagram follower since:', error)
		throw new Error('Failed to check Instagram follower since')
	}
}

export { checkInstagramFollowerSince }
