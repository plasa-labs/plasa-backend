import { getFirestore, DocumentSnapshot } from 'firebase-admin/firestore'

/**
 * Checks if a document exists in a specified Firestore collection.
 *
 * @param documentId - The ID of the document to check.
 * @param collectionId - The ID of the collection to search in.
 * @returns A Promise that resolves to the DocumentSnapshot if the document exists, or null if it doesn't.
 */
export async function checkDocumentInCollection(
	documentId: string,
	collectionId: string
): Promise<DocumentSnapshot | null> {
	const db = getFirestore()
	const collectionRef = db.collection(collectionId)

	try {
		// Check if the collection exists
		const collectionSnapshot = await collectionRef.limit(1).get()
		if (collectionSnapshot.empty) {
			throw new Error(`Collection ${collectionId} does not exist`)
		}

		const docRef = collectionRef.doc(documentId)
		const doc = await docRef.get()
		return doc.exists ? doc : null
	} catch (error) {
		console.error(`Error checking document ${documentId} in collection ${collectionId}:`, error)
		throw error
	}
}
