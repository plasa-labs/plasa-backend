import * as admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs/promises'

dotenv.config()

const collectionId = process.env.FOLLOWERS_COLLECTION_TO_PUSH
console.log('serviceAccountPath', process.env.SERVICE_ACCOUNT_PATH)
const serviceAccountPath = path.join(__dirname, process.env.SERVICE_ACCOUNT_PATH!)

initializeApp({
	credential: admin.credential.cert(serviceAccountPath)
})

const db = getFirestore()

// Function to read JSON file and add followers to Firestore
async function addFollowersToFirestore(): Promise<void> {
	try {
		// Read the JSON file
		const jsonPath = path.join(__dirname, process.env.FOLLOWERS_DATA_PATH!)
		const jsonData = await fs.readFile(jsonPath, 'utf8')
		const followers = JSON.parse(jsonData)

		const batchSize = 100
		let batch = db.batch()
		let count = 0

		for (const follower of followers) {
			const { value: username, timestamp } = follower.string_list_data[0]

			const docRef = db.collection(collectionId!).doc(username)
			batch.set(docRef, { follower_since: timestamp })

			count++

			if (count === batchSize) {
				await batch.commit()
				console.log(`Batch of ${batchSize} followers committed`)
				batch = db.batch()
				count = 0
			}
		}

		// Commit any remaining followers
		if (count > 0) {
			await batch.commit()
			console.log(`Final batch of ${count} followers committed`)
		}

		console.log('All followers have been added to Firestore.')
	} catch (error) {
		console.error('Error adding followers to Firestore:', error)
	}
}

// Call the function
void addFollowersToFirestore().then(() => {
	// Close the Firebase Admin SDK connection
	void admin.app().delete()
})
