import { checkDocumentInCollection } from './helper'

/**
 * Retrieves the 'follower since' timestamp for a given follower and followed user pair.
 * @param followerUsername - The username of the follower.
 * @param followedUsername - The username of the followed user.
 * @returns A promise that resolves to the timestamp when the follow relationship started, or null if not found.
 */
async function getFollowerSince(
	followerUsername: string,
	followedUsername: string
): Promise<number | null> {
	// Check if the follow relationship exists in the collection
	const doc = await checkDocumentInCollection(followerUsername, followedUsername)

	// If the document doesn't exist, return null
	if (!doc) {
		return null
	}

	// Return the 'follower_since' timestamp from the document
	return doc.get('follower_since')
}

export { getFollowerSince }
