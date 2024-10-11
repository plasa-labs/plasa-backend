/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { HttpsError } from 'firebase-functions/v1/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp()
const db = getFirestore()

export const helloWorld = onRequest((request, response) => {
	logger.info('Hello logs!', { structuredData: true })
	response.send('Hello from Firebase!')
})

export const checkFollowerSince = onRequest(async (request, response) => {
	try {
		const { collectionId, username } = request.query

		if (!collectionId) {
			throw new HttpsError('invalid-argument', 'Missing collectionId!')
		}
		if (!username) {
			throw new HttpsError('invalid-argument', 'Missing username!')
		}

		const docRef = db.collection(collectionId as string).doc(username as string)
		const doc = await docRef.get()

		if (!doc.exists) {
			response.json(false)
		} else {
			const followerSince = doc.data()?.follower_since
			response.json(followerSince || false)
		}
	} catch (error) {
		logger.error('Error in checkFollowerSince:', error)
		response.status(500).send('Internal Server Error')
	}
})
