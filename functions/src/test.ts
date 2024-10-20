import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'

// Example function (can be removed in production)
export const helloWorld = onRequest((request, response) => {
	logger.info('Hello logs!', { structuredData: true })
	response.send('Hello from Firebase!')
})
