import { getAllDocumentsInCollection } from './helper'

export interface Stamp {
	contractAddress: string
	chainId: number
	platform: string
	followedAccount: string
}

/**
 * Fetches all existing stamps from the "stamps" collection in Firestore.
 *
 * @returns A Promise that resolves to an array of Stamp objects.
 * @throws Error if there's an issue retrieving the stamps.
 */
export async function getAllExistingStamps(): Promise<Stamp[]> {
	try {
		const querySnapshot = await getAllDocumentsInCollection('stamps')

		return querySnapshot.docs.map((doc) => doc.data() as Stamp)
	} catch (error) {
		console.error('Error fetching all existing stamps:', error)
		throw new Error('Failed to retrieve stamps')
	}
}

/**
 * Fetches stamps from the "stamps" collection in Firestore based on the provided contract addresses.
 *
 * @param contractAddresses An array of contract addresses to filter the stamps.
 * @returns A Promise that resolves to an array of Stamp objects matching the provided contract addresses.
 * @throws Error if there's an issue retrieving the stamps.
 */
export async function getStampsByContractAddresses(contractAddresses: string[]): Promise<Stamp[]> {
	try {
		const querySnapshot = await getAllDocumentsInCollection('stamps')

		const filteredStamps = querySnapshot.docs
			.map((doc) => doc.data() as Stamp)
			.filter((stamp) => contractAddresses.includes(stamp.contractAddress))

		return filteredStamps
	} catch (error) {
		console.error('Error fetching stamps by contract addresses:', error)
		throw new Error('Failed to retrieve stamps')
	}
}
