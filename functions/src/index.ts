import { initializeApp } from 'firebase-admin/app'

/** Initialize Firebase app */
initializeApp()

import * as testFunctions from './test'
import * as prodFunctions from './prod'

/**
 * Export test functions
 * @namespace testFunctions
 */
export const { helloWorld } = testFunctions

/**
 * Export production functions
 * @namespace prodFunctions
 */
export const { getUserData, linkInstagram, getInstagramUsername } = prodFunctions
