import { checkDocumentInCollection } from './helper'

interface FollowerSinceResult {
	exists: boolean
	followerSince?: number
}

/**
 * Retrieves the 'follower since' date for a given username.
 * @param username - The username to look up.
 * @returns A promise that resolves to an object containing existence and follower since information.
 * @throws Error if the FOLLOWER_SINCE_COLLECTION environment variable is not set.
 */
async function getFollowerSince(username: string): Promise<FollowerSinceResult> {
	const collectionId = process.env.FOLLOWER_SINCE_COLLECTION

	if (!collectionId) {
		throw new Error('FOLLOWER_SINCE_COLLECTION environment variable is not set')
	}

	const doc = await checkDocumentInCollection(username, collectionId)

	if (!doc) {
		return { exists: false }
	}

	const followerSince = doc.get('follower_since')

	return { exists: true, followerSince }
}

export { getFollowerSince }
