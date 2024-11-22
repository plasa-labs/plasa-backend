import express from 'express'
import UserService from './service'
import { UserResponse } from './model'

const userRouter = express.Router()
const userService = new UserService()

/**
 * Retrieves full data for a user.
 */
export async function getUserData(req: express.Request, res: express.Response) {
	console.log('getUserData')
	try {
		const userId = req.params.id
		console.log('userId', userId)

		const userData: UserResponse = await userService.getUserData(userId)
		console.log(userData)

		return res.json(userData)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Failed to retrieve user data', error })
	}
}

// Route definitions using the controller functions
userRouter.get('/:id', getUserData)

export default userRouter
