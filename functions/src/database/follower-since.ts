import { checkDocumentInCollection } from './helper'

async function getFollowerSince(username: string) {
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
