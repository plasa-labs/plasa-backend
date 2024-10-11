import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { HttpsError } from 'firebase-functions/v1/auth'
import { signInstagramAccountOwnership } from './eip712/account-ownership'
import { signInstagramFollowerSince } from './eip712/follower-since'
import { checkDocumentInCollection } from './database/helper'

// Example function (can be removed in production)
export const helloWorld = onRequest((request, response) => {
	logger.info('Hello logs!', { structuredData: true })
	response.send('Hello from Firebase!')
})

/**
 * Reads data from Firestore based on collection and document IDs.
 * @param request - The HTTP request object containing query parameters.
 * @param response - The HTTP response object to send the result.
 */
export const readDataFromFirestore = onRequest(async (request, response) => {
	try {
		const { collectionId, documentId } = request.query

		// Type checking for query parameters
		if (typeof collectionId !== 'string') {
			throw new HttpsError('invalid-argument', 'Missing or invalid collectionId!')
		}
		if (typeof documentId !== 'string') {
			throw new HttpsError('invalid-argument', 'Missing or invalid documentId!')
		}

		// Fetch document from Firestore
		const doc = await checkDocumentInCollection(documentId, collectionId)

		// Send response
		response.json(doc ? doc.data() : false)
	} catch (error) {
		logger.error('Error in readDataFromFirestore:', error)
		response.status(500).send('Internal Server Error')
	}
})

/**
 * Generates a signature for Instagram account ownership.
 * @param request - The HTTP request object containing query parameters.
 * @param response - The HTTP response object to send the signature.
 */
export const instagramAccountOwnershipSignature = onRequest(async (request, response) => {
	try {
		const { username, recipient } = request.query

		// Type checking for query parameters
		if (typeof username !== 'string' || typeof recipient !== 'string') {
			throw new HttpsError('invalid-argument', 'Missing or invalid username or recipient!')
		}

		// Generate signature
		const signature = await signInstagramAccountOwnership(username, recipient)
		response.json({ signature })
	} catch (error) {
		logger.error('Error in instagramAccountOwnershipSignature:', error)
		response.status(500).send('Internal Server Error')
	}
})

/**
 * Generates a signature for Instagram follower relationship.
 */
export const instagramFollowerSinceSignature = onRequest(async (request, response) => {
	try {
		const { followed, follower, since, recipient } = request.query

		if (
			typeof followed !== 'string' ||
			typeof follower !== 'string' ||
			typeof since !== 'string' ||
			typeof recipient !== 'string'
		) {
			throw new HttpsError(
				'invalid-argument',
				'Missing or invalid followed, follower, since, or recipient!'
			)
		}

		const signature = await signInstagramFollowerSince(followed, follower, Number(since), recipient)
		response.json({ signature })
	} catch (error) {
		logger.error('Error in instagramFollowerSinceSignature:', error)
		response.status(500).send('Internal Server Error')
	}
})
