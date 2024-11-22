import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

/**
 * FirestoreService provides methods to interact with Firestore database.
 * It includes operations for reading, writing, deleting, and querying documents.
 */
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
	 * Retrieves all documents from a specified collection.
	 * @param collection - The name of the collection.
	 * @returns A promise that resolves to an array of document data.
	 * @throws An error if the collection is empty.
	 */
	async readAll(collection: string): Promise<FirebaseFirestore.DocumentData[]> {
		const collectionRef = db.collection(collection)

		const snapshot = await collectionRef.get()

		if (snapshot.empty) {
			throw new Error('Snapshot is empty')
		}

		// Map each document to its data
		const data = snapshot.docs.map((doc) => doc.data())

		return data
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
	 * Writes a new document to a specified collection.
	 * @param collection - The name of the collection.
	 * @param data - The data to write to the document.
	 * @returns A promise that resolves to the new document data.
	 */
	async writeNew(
		collection: string,
		data: FirebaseFirestore.DocumentData
	): Promise<FirebaseFirestore.DocumentData> {
		const docRef = db.collection(collection).doc()
		await docRef.set(data)
		const doc = await docRef.get()
		return doc.data()!
	}

	/**
	 * Sets a new field in a document if it doesn't already exist and no other document has the same value for that field.
	 * @param collection - The name of the collection.
	 * @param docId - The ID of the document to update.
	 * @param field - The field to set.
	 * @param value - The value to set for the field.
	 * @returns A promise that resolves to the updated document data or null if the operation is not possible.
	 * @throws An error if the field already exists or another document has the same value.
	 */
	async setUniqueField(
		collection: string,
		docId: string,
		field: string,
		value: unknown
	): Promise<FirebaseFirestore.DocumentData | null> {
		const docRef = db.collection(collection).doc(docId)
		const doc = await docRef.get()

		const data = doc.data()
		if (data && field in data) {
			throw new Error(`Field "${field}" already exists in the document`)
		}

		const querySnapshot = await this.queryDocuments(collection, field, value)
		if (!querySnapshot.empty) {
			throw new Error(`Another document already has the value "${value}" for field "${field}"`)
		}

		await docRef.set({ [field]: value }, { merge: true })
		const updatedDoc = await docRef.get()

		return updatedDoc.data()!
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
	 * Helper function to query documents from a specified collection where a specific field matches a given value.
	 * @param collection - The name of the collection.
	 * @param field - The field to query against.
	 * @param value - The value to match.
	 * @returns A promise that resolves to a QuerySnapshot.
	 * @private
	 */
	private async queryDocuments(
		collection: string,
		field: string,
		value: unknown
	): Promise<FirebaseFirestore.QuerySnapshot> {
		const collectionRef = db.collection(collection)
		return await collectionRef.where(field, '==', value).get()
	}

	/**
	 * Queries documents from a specified collection where a specific field matches a given value.
	 * @param collection - The name of the collection.
	 * @param field - The field to query against.
	 * @param value - The value to match.
	 * @returns A promise that resolves to an array of document data or null if no documents are found.
	 */
	async queryByField(
		collection: string,
		field: string,
		value: unknown
	): Promise<FirebaseFirestore.DocumentData[] | null> {
		const querySnapshot = await this.queryDocuments(collection, field, value)

		if (querySnapshot.empty) {
			return null
		}

		// Map each document to its data
		return querySnapshot.docs.map((doc) => doc.data())
	}

	/**
	 * Queries a document from a specified collection where a specific field matches a given value.
	 * Ensures that only one document is returned.
	 * @param collection - The name of the collection.
	 * @param field - The field to query against.
	 * @param value - The value to match.
	 * @returns A promise that resolves to the document data or null if no document is found.
	 * @throws An error if more than one document is found.
	 */
	async querySingleByField(
		collection: string,
		field: string,
		value: unknown
	): Promise<FirebaseFirestore.DocumentData | null> {
		const querySnapshot = await this.queryDocuments(collection, field, value)

		if (querySnapshot.size > 1) {
			throw new Error('More than one document found')
		}

		if (querySnapshot.empty) {
			return null
		}

		// Return the single document data
		return querySnapshot.docs[0].data()
	}

	/**
	 * Queries documents from a specified collection where multiple fields match given values.
	 * @param collection - The name of the collection.
	 * @param fieldValues - An object where keys are field names and values are the values to match.
	 * @returns A promise that resolves to an array of document data or null if no documents are found.
	 */
	async queryByFields(
		collection: string,
		fieldValues: Record<string, unknown>
	): Promise<FirebaseFirestore.DocumentData[] | null> {
		let query: FirebaseFirestore.Query = db.collection(collection)

		// Build the query with multiple field-value pairs
		for (const [field, value] of Object.entries(fieldValues)) {
			query = query.where(field, '==', value)
		}

		const querySnapshot = await query.get()

		if (querySnapshot.empty) {
			return null
		}

		// Map each document to its data
		return querySnapshot.docs.map((doc) => doc.data())
	}
}

export default FirestoreService
