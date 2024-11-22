import express from 'express'
import UserService from './service'
import { UserResponse } from './model'

const userRouter = express.Router()
const userService = new UserService()

/**
 * Retrieves full data for a user.
 */
export async function getUserFullData(req: express.Request, res: express.Response) {
	console.log('getUserFullData')
	try {
		const userId = req.params.id
		console.log('userId', userId)

		const userFullData: UserResponse = await userService.getUserFullData(userId)
		console.log(userFullData)

		return res.json(userFullData)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to retrieve user data', error })
	}
}

/**
 * Sets the Instagram username for a user.
 */
export async function setUserInstagram(req: express.Request, res: express.Response) {
	try {
		console.log('setUserInstagram')

		const userId = req.params.id
		console.log('userId', userId)

		if (!userId) {
			return res.status(400).json({ message: 'User ID is required' })
		}

		const { username } = req.body
		console.log('username', username)

		if (!username) {
			return res.status(400).json({ message: 'Instagram username is required' })
		}

		const updatedUserFullData: UserResponse | null = await userService.setUserInstagram(
			userId,
			username
		)

		console.log(updatedUserFullData)
		return res.json(updatedUserFullData)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to set Instagram username', error })
	}
}

// Route definitions using the controller functions
userRouter.get('/:id', getUserFullData)
userRouter.post('/:id/instagram', setUserInstagram)

export default userRouter
