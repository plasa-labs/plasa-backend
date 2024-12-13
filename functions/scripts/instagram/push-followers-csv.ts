import * as admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as csv from 'csv-parse'

dotenv.config()

const collectionId = process.env.FOLLOWERS_COLLECTION_TO_PUSH
console.log('collectionId', collectionId)
const serviceAccountPath = path.join(__dirname, process.env.SERVICE_ACCOUNT_PATH!)

initializeApp({
	credential: admin.credential.cert(serviceAccountPath)
})

const db = getFirestore()

// Convert the date to a Unix timestamp (seconds since epoch)
const timestamp = Math.floor(new Date('2024-06-12').getTime() / 1000)

async function uploadFollowers() {
	const csvFilePath = path.join(__dirname, process.env.CSV_FILE_PATH!)
	console.log('csvFilePath', csvFilePath)

	const fileContent = await fs.readFile(csvFilePath, 'utf-8')

	csv.parse(
		fileContent,
		{
			columns: true,
			skip_empty_lines: true
		},
		async (error, records) => {
			if (error) {
				console.error('Error parsing CSV:', error)
				return
			}

			const followersRef = db.collection(collectionId!)
			const batchSize = 100
			let batchCount = 0
			let totalUploaded = 0

			for (let i = 0; i < records.length; i += batchSize) {
				const batch = db.batch()
				const chunk = records.slice(i, i + batchSize)

				for (const record of chunk) {
					const docRef = followersRef.doc(record.userName)
					batch.set(docRef, {
						username: record.userName,
						follower_since: timestamp
					})
				}

				try {
					await batch.commit()
					batchCount++
					totalUploaded += chunk.length
					console.log(`Batch ${batchCount} committed. Total records uploaded: ${totalUploaded}`)
				} catch (err) {
					console.error(`Error uploading batch ${batchCount}:`, err)
				}
			}

			console.log('Followers data upload completed!')
			console.log(`Total batches: ${batchCount}, Total records uploaded: ${totalUploaded}`)
		}
	)
}

uploadFollowers()
