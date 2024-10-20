import { onRequest } from 'firebase-functions/v2/https'
import * as cors from 'cors'

import { getUserDataFromInstagram } from './instagram-data'
import { linkInstagramToAddress } from './database/link-instagram'
import { getLinkedInstagram } from './database/get-instagram'

import { UserData } from './return-interfaces'

import { ethers } from 'ethers'

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
	origin: true, // Allow any origin
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
})

export const getInstagramUsername = onRequest(async (request, response) => {
	corsHandler(request, response, async () => {
		const { userAddress } = request.query

		if (!ethers.isAddress(userAddress as string)) {
			throw new Error('Invalid Ethereum address')
		}

		const instagramUsername = await getLinkedInstagram(userAddress as string)

		response.json({ instagramUsername })
	})
})

export const getUserData = onRequest(async (request, response) => {
	corsHandler(request, response, async () => {
		try {
			const { userAddress, stampAddresses } = request.query

			if (typeof userAddress !== 'string') {
				throw new Error('Invalid userAddress parameter')
			}

			if (!ethers.isAddress(userAddress)) {
				throw new Error('Invalid Ethereum address')
			}

			let userData: UserData

			let stampAddressesArray: string[] | undefined = undefined
			if (stampAddresses) {
				if (typeof stampAddresses === 'string') {
					// If it's a single string, split it by comma
					stampAddressesArray = stampAddresses.split(',')
				} else if (Array.isArray(stampAddresses)) {
					// If it's already an array, map each item to string
					stampAddressesArray = stampAddresses.map(String)
				} else {
					throw new Error('Invalid stampAddresses parameter')
				}

				userData = await getUserDataFromInstagram(userAddress, stampAddressesArray)
			} else {
				userData = {
					address: userAddress,
					instagramUsername: await getLinkedInstagram(userAddress),
					availableStamps: null
				}
			}

			response.json(userData)
		} catch (error) {
			console.error('Error in getUserData:', error)
			response.status(500).json({ error: 'Internal Server Error' })
		}
	})
})

export const linkInstagram = onRequest(async (request, response) => {
	corsHandler(request, response, async () => {
		try {
			const { userAddress, instagramUsername } = request.body

			if (typeof userAddress !== 'string' || typeof instagramUsername !== 'string') {
				throw new Error('Invalid input parameters')
			}

			if (!ethers.isAddress(userAddress)) {
				throw new Error('Invalid Ethereum address')
			}

			// Link Instagram to address
			await linkInstagramToAddress(userAddress, instagramUsername)

			// Get user data after linking
			const userData = await getUserDataFromInstagram(userAddress)

			response.json(userData)
		} catch (error) {
			console.error('Error in linkInstagram:', error)
			response.status(500).json({ error: 'Internal Server Error' })
		}
	})
})
