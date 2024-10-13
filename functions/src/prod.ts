import { onRequest } from 'firebase-functions/v2/https'
import { EIP712Signer } from './eip712/eip712'
import { spaces } from './spaces/spaces'
import { getFollowerSince } from './database/follower-since'
import { generateRandomString, generateRandomFollowerSince } from './utils/random'
import * as cors from 'cors'

/**
 * Interface representing the signature data for a follower.
 */
interface SignatureData {
	spaceName: string // Name of the space
	signature: string // EIP-712 signature
	followerSince: number // Timestamp of when the user started following
	deadline: number // Expiration timestamp for the signature
	isReal: boolean // Indicates if the follower data is real or generated
	instagramUsername: string // Instagram username of the follower
}

/**
 * Generates a signature for a follower's data.
 *
 * @param signer - The EIP712Signer instance
 * @param spaceName - Name of the space
 * @param followedUsername - Username of the followed account
 * @param followerUsername - Username of the follower
 * @param followerSince - Timestamp of when the user started following
 * @param recipient - Ethereum address of the recipient
 * @param verifyingContract - Address of the contract that will verify the signature
 * @param isReal - Indicates if the follower data is real or generated
 * @returns A Promise resolving to SignatureData
 */
async function generateSignature(
	signer: EIP712Signer,
	spaceName: string,
	followedUsername: string,
	followerUsername: string,
	followerSince: number,
	recipient: string,
	verifyingContract: string,
	isReal: boolean
): Promise<SignatureData> {
	const { signature, deadline } = await signer.signFollowerSince(
		verifyingContract,
		followedUsername,
		followerUsername,
		followerSince,
		recipient
	)

	return {
		spaceName,
		signature,
		followerSince,
		deadline,
		isReal,
		instagramUsername: followerUsername // Add this line
	}
}

/**
 * Firebase Cloud Function to generate signatures for follower data.
 * This function handles both real Instagram usernames and generates fake data when needed.
 *
 * Query Parameters:
 * - userAddress: (required) Ethereum address of the user
 * - instagramUsername: (optional) Instagram username of the follower
 *
 * @returns An array of SignatureData objects for each space
 */
const corsHandler = cors({
	origin: (origin, callback) => {
		if (!origin || origin.startsWith('http://localhost')) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	methods: ['GET'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
})

export const signatures = onRequest(async (request, response) => {
	return corsHandler(request, response, async () => {
		const { userAddress, instagramUsername } = request.query

		// Validate userAddress
		if (typeof userAddress !== 'string') {
			response.status(400).send('Missing or invalid userAddress')
			return
		}

		// Validate instagramUsername if provided
		if (instagramUsername && typeof instagramUsername !== 'string') {
			response.status(400).send('Invalid instagramUsername')
			return
		}

		const signer = new EIP712Signer()
		const results: SignatureData[] = []

		// Generate a single random followerUsername if instagramUsername is not provided
		const randomFollowerUsername = instagramUsername || `fakeuser${generateRandomString(8)}`

		// Process each space
		for (const space of spaces) {
			let followerUsername: string
			let followerSince: number
			let isReal: boolean

			if (instagramUsername) {
				// Use provided Instagram username and check if they're a real follower
				followerUsername = instagramUsername
				const since = await getFollowerSince(followerUsername, space.followedUsername)
				if (since) {
					// Real follower data found
					followerSince = since
					isReal = true
				} else {
					// Generate fake data for non-followers
					followerSince = generateRandomFollowerSince()
					isReal = false
				}
			} else {
				// Generate fake data when no Instagram username is provided
				followerUsername = randomFollowerUsername
				followerSince = generateRandomFollowerSince()
				isReal = false
			}

			// Generate signature for the current space
			const signatureData = await generateSignature(
				signer,
				space.name,
				space.followedUsername,
				followerUsername,
				followerSince,
				userAddress,
				space.followerSinceStampContractAddress,
				isReal
			)

			results.push(signatureData)
		}

		// Send the results as JSON response
		response.json(results)
	})
})
