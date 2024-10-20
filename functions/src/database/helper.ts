import { getFirestore, DocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore'

/**
 * Checks if a document exists in a specified Firestore collection.
 *
 * @param documentId - The ID of the document to check.
 * @param collectionId - The ID of the collection to search in.
 * @returns A Promise that resolves to the DocumentSnapshot if the document exists, or null if it doesn't.
 * @throws Error if the collection doesn't exist or if there's an error during the operation.
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
			throw new Error(`Collection '${collectionId}' does not exist`)
		}

		// Attempt to retrieve the document
		const docRef = collectionRef.doc(documentId)
		const doc = await docRef.get()

		// Return the document if it exists, otherwise return null
		return doc.exists ? doc : null
	} catch (error) {
		console.error(`Error checking document '${documentId}' in collection '${collectionId}':`, error)
		throw error // Re-throw the error for the caller to handle
	}
}

/**
 * Retrieves all documents from a specified Firestore collection.
 *
 * @param collectionId - The ID of the collection to retrieve documents from.
 * @returns A Promise that resolves to a QuerySnapshot containing all documents in the collection.
 * @throws Error if the collection doesn't exist or if there's an error during the operation.
 */
export async function getAllDocumentsInCollection(collectionId: string): Promise<QuerySnapshot> {
	const db = getFirestore()
	const collectionRef = db.collection(collectionId)

	try {
		// Check if the collection exists
		const collectionSnapshot = await collectionRef.limit(1).get()
		if (collectionSnapshot.empty) {
			throw new Error(`Collection '${collectionId}' does not exist`)
		}

		// Retrieve all documents in the collection
		const querySnapshot = await collectionRef.get()
		return querySnapshot
	} catch (error) {
		console.error(`Error retrieving documents from collection '${collectionId}':`, error)
		throw error // Re-throw the error for the caller to handle
	}
}
