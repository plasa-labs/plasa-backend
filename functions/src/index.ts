import { initializeApp } from 'firebase-admin/app'
import { onRequest } from 'firebase-functions/v2/https'
import { Hono } from 'hono'
import { getRequestListener } from '@hono/node-server'

/** Initialize Firebase app */
initializeApp()

import userRouter from './user/controller'

/** Create a new Hono app */
const app = new Hono()

/** Middleware to apply CORS headers */
app.use('*', async (c, next) => {
	c.res.headers.set('Access-Control-Allow-Origin', '*')
	c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
	c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	await next()
})

app.onError((error, c) => {
	console.error('Error occurred:', error)
	return c.text('Internal Server Error', 500)
})

app.notFound((c) => {
	return c.text('Not Found', 404)
})

/** Define a simple route */
app.get('/', (c) => c.text('Hello!'))

/** Use the userRouter for /user routes */
app.route('/user', userRouter)

/** Export the API for Firebase Functions */
export const api = onRequest(getRequestListener(app.fetch))
