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

import { signInstagramAccountOwnership } from './eip712/account-ownership'
import { signInstagramFollowerSince } from './eip712/follower-since'
import { getFollowerSince } from './database/follower-since'

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp()
const db = getFirestore()

// Testing functions

export const helloWorld = onRequest((request, response) => {
	logger.info('Hello logs!', { structuredData: true })
	response.send('Hello from Firebase!')
})

// Testing firestore read

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

// Testing EIP712 signatures
// Deadline is automatically added to the message

export const instagramAccountOwnershipSignature = onRequest(async (request, response) => {
	const username = request.query.username as string
	const recipient = request.query.recipient as string

	if (!username || !recipient) {
		throw new HttpsError('invalid-argument', 'Missing username, recipient, or deadline!')
	}

	const signature = await signInstagramAccountOwnership(username, recipient)
	response.json({ signature })
})

export const instagramFollowerSinceSignature = onRequest(async (request, response) => {
	// This function is being used to test the follower since signature
	// Since should be queried from firestore instead of being passed in as a parameter
	const { followed, follower, since, recipient } = request.query

	if (!followed || !follower || !since || !recipient) {
		throw new HttpsError(
			'invalid-argument',
			'Missing followed, follower, since, recipient, or deadline!'
		)
	}

	const signature = await signInstagramFollowerSince(
		followed as string,
		follower as string,
		Number(since),
		recipient as string
	)
	response.json({ signature })
})

// Production functions

// Esta debería la única función que habría que llamar del back
// Mandas username y address, te devuelve todos los datos necesarios

// Siempre te devuelve firma para stamp de ownership de cuenta
// Si no es follower, te agrega isFollower: false
// Y si es follower, te agrega isFollower: true, followerSince y firma para stamp de follower
export const instagramUsernameData = onRequest(async (request, response) => {
	const { username, userAddress } = request.body

	if (!username || !userAddress) {
		response.status(400).json({ error: 'Missing username or userAddress' })
		return
	}

	const responseObject: InstagramUserDataResponse = {}

	try {
		const accountOwnershipStampSignature = await signInstagramAccountOwnership(
			username,
			userAddress
		)
		responseObject.accountOwnershipStampSignature = accountOwnershipStampSignature
	} catch (error) {
		console.error('Error signing account ownership:', error)
		response.status(500).json({ error: 'Error signing account ownership' })
	}

	try {
		const followerData = await getFollowerSince(username)

		if (!followerData) {
			responseObject.isFollower = false
		} else {
			responseObject.isFollower = true
			const { followerSince } = followerData
			responseObject.followerSince = followerSince

			const followerStampSignature = await signInstagramFollowerSince(
				username,
				userAddress,
				followerSince,
				userAddress
			)
			responseObject.followerStampSignature = followerStampSignature
		}

		response.status(200).json(responseObject)
	} catch (error) {
		console.error('Error checking follower status:', error)
		response.status(500).json({ error: 'Error checking follower status' })
	}
})

interface InstagramUserDataResponse {
	accountOwnershipStampSignature?: string
	isFollower?: boolean
	followerSince?: number
	followerStampSignature?: string
}
