import { initializeApp } from 'firebase-admin/app'
import * as testFunctions from './test'
import * as prodFunctions from './prod'

/** Initialize Firebase app */
initializeApp()

/**
 * Export test functions
 * @namespace testFunctions
 */
export const {
	/** Function to test "Hello World" */
	helloWorld
	// /** Function to read data from Firestore */
	// readDataFromFirestore,
	// /** Function to generate Instagram account ownership signature */
	// instagramAccountOwnershipSignature,
	// /** Function to generate Instagram follower since signature */
	// instagramFollowerSinceSignature
} = testFunctions

/**
 * Export production functions
 * @namespace prodFunctions
 */
export const {
	/** Function to fetch Instagram user data */
	signatures
} = prodFunctions
