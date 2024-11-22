import express from 'express'
import InstagramCodesService from './service'
import { ManyChatInstagramUser } from './model'

/**
 * Express Router for handling Instagram verification code endpoints
 */
const instagramCodesRouter = express.Router()

/**
 * Service instance for handling Instagram code operations
 */
const instagramCodesService = new InstagramCodesService()

/**
 * Middleware to validate the ManyChat API key.
 * Checks if the provided x-manychat-token header matches the environment variable.
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 * @returns {void}
 * @throws {Error} If token validation fails
 */
export function validateManyChatToken(
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
): void {
	try {
		const manyChatToken = process.env.MANYCHAT_TOKEN
		if (!manyChatToken) {
			console.error('MANYCHAT_TOKEN environment variable is not set')
			res.status(500).json({ message: 'ManyChat token validation failed' })
			return
		}

		const providedToken = req.headers['x-manychat-token']
		if (providedToken !== manyChatToken) {
			res.status(401).json({ message: 'Invalid ManyChat token' })
			return
		}

		next()
	} catch (error) {
		console.error('Error validating ManyChat token:', error)
		res.status(500).json({ message: 'ManyChat token validation failed', error })
	}
}

/**
 * Handles requests for Instagram verification codes.
 * Processes incoming ManyChat webhook data and returns appropriate Instagram codes.
 *
 * @param {express.Request} req - Express request object containing ManyChat user data
 * @param {express.Response} res - Express response object
 * @returns {Promise<express.Response>} JSON response with Instagram code data or error message
 * @throws {Error} If processing fails or invalid data is provided
 */
export async function getInstagramCode(req: express.Request, res: express.Response) {
	try {
		const manyChatData = req.body as ManyChatInstagramUser

		if (!manyChatData || !manyChatData.ig_id) {
			return res.status(400).json({ message: 'Invalid request data' })
		}

		const response = await instagramCodesService.handleManyChatInstagramUser(manyChatData)
		return res.json(response)
	} catch (error) {
		console.error('Error in getInstagramCode:', error)
		return res.status(500).json({ message: 'Failed to process Instagram code request', error })
	}
}

/**
 * POST endpoint for retrieving Instagram verification codes
 * Protected by ManyChat token validation middleware
 */
instagramCodesRouter.post('/code', validateManyChatToken, getInstagramCode)

export default instagramCodesRouter
