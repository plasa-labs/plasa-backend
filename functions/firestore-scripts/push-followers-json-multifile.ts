import * as admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs/promises'

dotenv.config()

// Add environment variable checks
if (!process.env.SERVICE_ACCOUNT_PATH) {
	throw new Error('SERVICE_ACCOUNT_PATH environment variable is not set')
}

if (!process.env.INSTAGRAM_ACCOUNT_TO_PUSH) {
	throw new Error('INSTAGRAM_ACCOUNT_TO_PUSH environment variable is not set')
}

const serviceAccountPath = path.join(__dirname, process.env.SERVICE_ACCOUNT_PATH)
const folderName = process.env.INSTAGRAM_ACCOUNT_TO_PUSH
const collectionId = 'followers-instagram-' + folderName

initializeApp({
	credential: admin.credential.cert(serviceAccountPath)
})

const db = getFirestore()

// Add these variables at the top level of the file
let grandTotalFollowers = 0
let grandTotalSkipped = 0

async function addFollowersToFirestore(
	filePath: string
): Promise<{ added: number; skipped: number }> {
	try {
		const jsonData = await fs.readFile(filePath, 'utf8')
		const followers = JSON.parse(jsonData)
		console.log(`Processing ${followers.length} followers from ${path.basename(filePath)}`)

		const batchSize = 500
		let batch = db.batch()
		let count = 0

		let totalFollowers = 0
		let skippedFollowers = 0
		for (const follower of followers) {
			const { value: username, timestamp } = follower.string_list_data[0]

			try {
				// if (username.startsWith('__') && username.endsWith('__')) {
				// if (username.startsWith('__') && username.endsWith('__')) {
				// 	console.warn(`Skipping reserved username: ${username}`)
				// 	skippedFollowers++
				// 	continue
				// }

				const modifiedUsername = '@' + username

				const docRef = db.collection(collectionId!).doc(modifiedUsername)
				batch.set(docRef, { follower_since: timestamp, username: username })

				count++

				if (count === batchSize) {
					await batch.commit()
					console.log(`Batch of ${batchSize} followers committed from ${path.basename(filePath)}`)
					batch = db.batch() // Create a new batch after committing
					count = 0
				}
				totalFollowers++
			} catch (error) {
				if (
					(error as { code?: number; details?: string }).code === 3 &&
					(error as { code?: number; details?: string }).details?.includes(
						'is invalid because it is reserved'
					)
				) {
					console.warn(`Skipping reserved username: ${username}`)
					skippedFollowers++
				} else {
					console.error(`Error adding follower ${username}:`, error)
				}
				// Continue processing other followers
			}
		}

		if (count > 0) {
			await batch.commit()
			console.log(`Final batch of ${count} followers committed from ${path.basename(filePath)}`)
		}

		console.log(
			`File Summary: ${path.basename(filePath)}\n` +
				`  Total followers added: ${totalFollowers}\n` +
				`  Skipped followers: ${skippedFollowers}\n` +
				`  Total processed: ${totalFollowers + skippedFollowers}`
		)

		return { added: totalFollowers, skipped: skippedFollowers }
	} catch (error) {
		console.error(`Error processing ${path.basename(filePath)}:`, error)
		return { added: 0, skipped: 0 }
	}
}

async function processAllFollowerFiles(): Promise<void> {
	const folderPath = path.join(process.cwd(), 'data', folderName!)
	console.log(`Starting to process follower files from: ${folderPath}`)

	try {
		// Check if the directory exists
		try {
			await fs.access(folderPath)
		} catch (error) {
			console.error(`Error: The directory '${folderPath}' does not exist.`)
			console.error(
				`Please make sure the FOLLOWERS_FOLDER_NAME environment variable is set correctly.`
			)
			console.error(`Current value: ${folderName}`)
			console.error(error)
			return
		}

		const files = await fs.readdir(folderPath)
		const jsonFiles = files.filter(
			(file) => file.startsWith('followers_') && file.endsWith('.json')
		)

		console.log(`Found ${jsonFiles.length} follower files to process in ${folderPath}.`)

		for (const file of jsonFiles) {
			const filePath = path.join(folderPath, file)
			console.log(`Processing file: ${file}`)
			try {
				const { added, skipped } = await addFollowersToFirestore(filePath)
				grandTotalFollowers += added
				grandTotalSkipped += skipped
			} catch (error) {
				console.error(`Failed to process file ${file}:`, error)
				// Continue processing other files
			}
		}

		console.log(`All ${jsonFiles.length} follower files have been processed.`)
		console.log(
			`Grand Total Summary:\n` +
				`  Total followers added: ${grandTotalFollowers}\n` +
				`  Total followers skipped: ${grandTotalSkipped}\n` +
				`  Total followers processed: ${grandTotalFollowers + grandTotalSkipped}`
		)
	} catch (error) {
		console.error('Error processing follower files:', error)
	}
}

void processAllFollowerFiles().then(() => {
	console.log('Script execution completed. Cleaning up...')
	void admin.app().delete()
})
