import { initializeApp } from 'firebase-admin/app'
import { onRequest } from 'firebase-functions/v2/https'
import express from 'express'
import cors from 'cors'

/** Initialize Firebase app */
initializeApp()

import userRouter from './user/controller'

/** Create a new Express app */
const app = express()

/** Middleware to apply CORS headers */
app.use(cors())
app.use(express.json())

// Add proper error handling middleware with all 4 parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('Error occurred:', err)
	res.status(500).json({ message: 'Internal Server Error', error: err.message })
})

app.get('/', (req, res) => res.send('Hello!'))

app.use('/user', userRouter)

app.use((req: express.Request, res: express.Response) => {
	res.status(404).json({ message: 'Not Found' })
})

/** Export the API for Firebase Functions */
export const api = onRequest(app)
