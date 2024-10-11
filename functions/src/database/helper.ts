import { getFirestore, DocumentSnapshot } from 'firebase-admin/firestore'

export async function checkDocumentInCollection(
	documentId: string,
	collectionId: string
): Promise<DocumentSnapshot | null> {
	const db = getFirestore()
	const docRef = db.collection(collectionId).doc(documentId)
	const doc = await docRef.get()

	// Return the entire document snapshot instead of just the exists property
	return doc.exists ? doc : null
}
