import * as admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs/promises'

dotenv.config()

// Validate required environment variables
if (!process.env.SERVICE_ACCOUNT_PATH) {
	throw new Error('SERVICE_ACCOUNT_PATH environment variable is not set')
}

if (!process.env.MP_USER_ID) {
	throw new Error('MP_USER_ID environment variable is not set')
}

const serviceAccountPath = path.join(__dirname, process.env.SERVICE_ACCOUNT_PATH)
const collectionId = `mp-payments-${process.env.MP_USER_ID}`

const inputDir = path.join(__dirname, '..', '..', 'data', collectionId)

// Initialize Firebase
initializeApp({
	credential: admin.credential.cert(serviceAccountPath)
})

const db = getFirestore()

async function pushPaymentsToFirestore(): Promise<void> {
	const batchSize = 500
	let batchCount = 0
	let totalUploaded = 0

	try {
		// Check if directory exists
		try {
			await fs.access(inputDir)
		} catch (error) {
			console.error(`Error: The directory '${inputDir}' does not exist.`)
			console.error(error)
			return
		}

		// Read all files in the input directory
		const files = await fs.readdir(inputDir)
		const jsonFiles = files.filter((file) => file.endsWith('.json'))

		console.log(`Found ${jsonFiles.length} JSON files to process`)

		// Process files in batches
		for (let i = 0; i < jsonFiles.length; i += batchSize) {
			const batch = db.batch()
			const chunk = jsonFiles.slice(i, i + batchSize)

			for (const file of chunk) {
				try {
					const filePath = path.join(inputDir, file)
					const fileContent = await fs.readFile(filePath, 'utf-8')
					const payment = JSON.parse(fileContent)

					const docRef = db.collection(collectionId).doc(payment.id.toString())
					batch.set(docRef, {
						...payment,
						imported_at: admin.firestore.FieldValue.serverTimestamp()
					})
				} catch (error) {
					console.error(`Error processing file ${file}:`, error)
					continue
				}
			}

			await batch.commit()
			batchCount++
			totalUploaded += chunk.length
			console.log(`Batch ${batchCount} committed. Total payments uploaded: ${totalUploaded}`)
		}

		console.log('Payment data upload completed!')
		console.log(`Total batches: ${batchCount}, Total payments uploaded: ${totalUploaded}`)
	} catch (error) {
		console.error('Error uploading payments:', error)
		throw error
	}
}

async function main() {
	try {
		console.log(`Starting to push payments from ${inputDir} to ${collectionId}...`)
		await pushPaymentsToFirestore()
	} catch (error) {
		console.error('Script execution failed:', error)
	} finally {
		// Clean up Firebase connection
		await admin.app().delete()
	}
}

void main()
