import express from 'express'
import InstagramCodesGenerationService from './services/generationService'
import InstagramCodesVerificationService from './services/verificationService'
import { ManyChatInstagramUser, InstagramCodeVerificationBody } from './model'

/**
 * Express Router for handling Instagram verification code endpoints
 */
const instagramCodesRouter = express.Router()

/**
 * Service instance for handling Instagram code operations
 */
const instagramCodesGenerationService = new InstagramCodesGenerationService()
const instagramCodesVerificationService = new InstagramCodesVerificationService()

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
export async function getInstagramCode(
	req: express.Request,
	res: express.Response
): Promise<express.Response> {
	try {
		const manyChatData = req.body as ManyChatInstagramUser

		if (!manyChatData || !manyChatData.ig_id) {
			return res.status(400).json({ message: 'Invalid request data' })
		}

		const response = await instagramCodesGenerationService.getCodeMessage(manyChatData)
		return res.json(response)
	} catch (error) {
		console.error('Error in getInstagramCode:', error)
		return res.status(500).json({ message: 'Failed to process Instagram code request', error })
	}
}

/**
 * Verifies an Instagram verification code.
 * Validates the provided code against stored codes for the given user.
 *
 * @param {express.Request} req - Express request object containing verification data
 * @param {express.Response} res - Express response object
 * @returns {Promise<express.Response>} JSON response with verification result or error message
 * @throws {Error} If verification fails or invalid data is provided
 */
export async function verifyInstagramCode(
	req: express.Request,
	res: express.Response
): Promise<express.Response> {
	try {
		const verificationData = req.body as InstagramCodeVerificationBody

		// Add input validation
		if (!verificationData || !verificationData.code || !verificationData.user_id) {
			return res.status(400).json({ message: 'Invalid verification data' })
		}

		const code = verificationData.code as number
		const userId = verificationData.user_id as string

		const response = await instagramCodesVerificationService.verifyCode(userId, code)
		return res.json(response)
	} catch (error) {
		console.error('Error in verifyInstagramCode:', error)
		return res.status(500).json({ message: 'Failed to process Instagram code verification', error })
	}
}

/**
 * Express Router for Instagram code operations.
 * Provides endpoints for code generation and verification with ManyChat token validation.
 *
 * Routes:
 * - POST /code: Generate Instagram verification codes
 * - POST /verify: Verify provided Instagram codes
 */
instagramCodesRouter.post('/code', validateManyChatToken, getInstagramCode)
instagramCodesRouter.post('/verify', validateManyChatToken, verifyInstagramCode)

export default instagramCodesRouter
