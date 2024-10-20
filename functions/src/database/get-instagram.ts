import { getFirestore } from 'firebase-admin/firestore'

/**
 * Checks if an address has a linked Instagram account.
 *
 * @param address - The Ethereum address to check.
 * @returns A Promise that resolves to the linked Instagram username if found, or null if not found.
 */
export async function getLinkedInstagram(address: string): Promise<string | null> {
	const db = getFirestore()
	const addressRef = db.collection('addressToPlatforms').doc(address)

	try {
		const doc = await addressRef.get()

		if (doc.exists) {
			const data = doc.data()
			return data?.instagram || null
		}

		return null
	} catch (error) {
		console.error(`Error checking linked Instagram for address ${address}:`, error)
		throw error
	}
}
