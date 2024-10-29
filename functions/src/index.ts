import { initializeApp } from 'firebase-admin/app'
import { Hono } from 'hono'
import { onRequest, Request as FirebaseRequest } from 'firebase-functions/v2/https'
import userRouter from './user/controller'

/** Initialize Firebase app */
initializeApp()

/** Create a new Hono app */
const app = new Hono()

// app.use('*', async (c, next) => {
// 	console.log(`Incoming request: ${c.req.method} ${c.req.path}`)
// 	await next()
// })

/** Define a simple route */
app.get('/', (c) => c.text('Hono!'))

/** Use the userRouter for /user routes */
app.route('/user', userRouter)

// app.onError((error, c) => {
// 	console.error('Error occurred:', error)
// 	return c.text('Internal Server Error', 500)
// })

/** Function to adapt Firebase request to Hono request */
const adaptRequest = (req: FirebaseRequest) => {
	return new Request(req.url, {
		method: req.method,
		headers: req.headers as HeadersInit,
		body: req.body
	})
}

/** Export the Hono app as a Firebase Function */
export const api = onRequest(async (req, res) => {
	const honoReq = adaptRequest(req)

	const honoResponse = await app.fetch(honoReq)

	// Set the status and send the response back
	res.status(honoResponse.status).send(await honoResponse.text())
})
