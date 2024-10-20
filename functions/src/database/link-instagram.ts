import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()

export const linkInstagramToAddress = async (
	address: string,
	instagramUsername: string
): Promise<void> => {
	const addressRef = db.collection('addressToPlatforms').doc(address)
	const instagramRef = db.collection('instagramToAddress').doc(instagramUsername)

	// Check if either document already exists
	const [addressDoc, instagramDoc] = await Promise.all([addressRef.get(), instagramRef.get()])

	if (addressDoc.exists && addressDoc.data()?.instagram) {
		throw new functions.https.HttpsError(
			'already-exists',
			'Address is already linked to an Instagram account'
		)
	}

	if (instagramDoc.exists) {
		throw new functions.https.HttpsError(
			'already-exists',
			'Instagram username is already linked to an address'
		)
	}

	// If neither exists or address doesn't have Instagram, create/update both documents
	await db.runTransaction(async (transaction) => {
		if (addressDoc.exists) {
			transaction.update(addressRef, { instagram: instagramUsername })
		} else {
			transaction.set(addressRef, { instagram: instagramUsername })
		}
		transaction.set(instagramRef, { address: address })
	})
}
