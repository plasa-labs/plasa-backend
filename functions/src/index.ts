import { initializeApp } from 'firebase-admin/app'
import { onRequest } from 'firebase-functions/v2/https'
import express from 'express'
import cors from 'cors'

/** Initialize Firebase app */
initializeApp()

import userRouter from './user/controller'
import instagramCodesRouter from './instagram-codes/controller'

/** Create a new Express app */
const app = express()

/** Middleware to apply CORS headers */
app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'production'
				? ['https://plasa.vercel.app', 'https://alpha.ddfundacion.org'] // Specify allowed domains in production
				: true, // Allow all origins in development
		methods: ['GET', 'POST'],
		credentials: true,
		optionsSuccessStatus: 204
	})
)

// Add request size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/', (req, res) => res.send('Hello!'))

app.use('/user', userRouter)
app.use('/instagram', instagramCodesRouter)

app.use((req: express.Request, res: express.Response) => {
	res.status(404).json({ message: 'Not Found' })
})

// Improve error handling with proper typing
interface ApiError extends Error {
	status?: number
	code?: string
}

app.use(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(err: ApiError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
		console.error('Error occurred:', err)
		const statusCode = err.status || 500
		res.status(statusCode).json({
			message: err.message || 'Internal Server Error',
			code: err.code,
			...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
		})
	}
)

/** Export the API for Firebase Functions */
export const api = onRequest(app)
