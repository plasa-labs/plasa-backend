import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

class FirestoreService {
	/**
	 * Reads a document from a specified collection.
	 * @param collection - The name of the collection.
	 * @param docId - The ID of the document to read.
	 * @returns A promise that resolves to the document data or null if the document does not exist.
	 */
	async read(collection: string, docId: string): Promise<FirebaseFirestore.DocumentData | null> {
		const docRef = db.collection(collection).doc(docId)
		const doc = await docRef.get()
		const data = doc.data()
		// Return the document data if it exists, otherwise return null
		return doc.exists && data ? data : null
	}

	/**
	 * Writes data to a document in a specified collection. If the document exists, it merges the data.
	 * @param collection - The name of the collection.
	 * @param docId - The ID of the document to write to.
	 * @param data - The data to write to the document.
	 * @returns A promise that resolves to the updated document data.
	 */
	async write(
		collection: string,
		docId: string,
		data: FirebaseFirestore.DocumentData
	): Promise<FirebaseFirestore.DocumentData> {
		const docRef = db.collection(collection).doc(docId)
		// Set the document data with merge option
		await docRef.set(data, { merge: true })
		const updatedData = await docRef.get()
		// Return the updated document data
		return updatedData.data()!
	}

	/**
	 * Deletes a document from a specified collection.
	 * @param collection - The name of the collection.
	 * @param docId - The ID of the document to delete.
	 * @returns A promise that resolves when the document is deleted.
	 */
	async delete(collection: string, docId: string): Promise<void> {
		const docRef = db.collection(collection).doc(docId)
		// Delete the document
		await docRef.delete()
	}

	/**
	 * Retrieves all documents from a specified collection.
	 * @param collection - The name of the collection.
	 * @returns A promise that resolves to an array of document data.
	 */
	async getAll(collection: string): Promise<FirebaseFirestore.DocumentData[]> {
		const collectionRef = db.collection(collection)
		const snapshot = await collectionRef.get()
		// Map each document to its data
		return snapshot.docs.map((doc) => doc.data())
	}
}

export default FirestoreService
