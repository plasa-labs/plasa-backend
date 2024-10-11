import * as admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config()

const collectionId = process.env.COLLECTION_TO_READ
const serviceAccountPath = path.join(__dirname, process.env.SERVICE_ACCOUNT_PATH!)

initializeApp({
	credential: admin.credential.cert(serviceAccountPath)
})

const db = getFirestore()

// Function to read and log all documents from firestore collection
async function readFollowers(): Promise<void> {
	try {
		const snapshot = await db.collection(collectionId!).get()

		if (snapshot.empty) {
			console.log(`No documents found in the ${collectionId} collection.`)
			return
		}

		console.log(`Documents in ${collectionId} collection:`)
		snapshot.forEach((doc) => {
			console.log(`Document ID: ${doc.id}`)
			console.log('Data:', doc.data())
			console.log('---')
		})
	} catch (error) {
		console.error('Error reading documents:', error)
	}
}

// Call the function
readFollowers().then(() => {
	// Close the Firebase Admin SDK connection
	admin.app().delete()
})
