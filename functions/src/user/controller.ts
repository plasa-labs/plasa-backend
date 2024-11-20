import { Hono, Context } from 'hono'
import UserService from './service'
import { UserFullData } from './model'

const userService = new UserService()

/**
 * Retrieves full data for a user.
 * @param ctx - The context object containing the request and response.
 */
export async function getUserFullData(ctx: Context) {
	console.log('getUserFullData')
	try {
		const userId = ctx.req.param('id')
		console.log('userId', userId)

		const userFullData: UserFullData = await userService.getUserFullData(userId)
		console.log(userFullData)

		return ctx.json(userFullData)
	} catch (error) {
		console.error(error)
		return ctx.json({ message: 'Failed to retrieve user data', error }, 500)
	}
}

/**
 * Sets the Instagram username for a user.
 * @param ctx - The context object containing the request and response.
 */
export async function setUserInstagram(ctx: Context) {
	try {
		console.log('setUserInstagram')

		const userId = ctx.req.param('id')
		console.log('userId', userId)

		if (!userId) {
			return ctx.json({ message: 'User ID is required' }, 400)
		}

		const username = ctx.req.query('username')
		console.log('username', username)

		if (!username) {
			return ctx.json({ message: 'Instagram username is required' }, 400)
		}

		const updatedUserFullData: UserFullData | null = await userService.setUserInstagram(
			userId,
			username
		)

		console.log(updatedUserFullData)
		return ctx.json(updatedUserFullData)
	} catch (error) {
		console.error(error)
		return ctx.json({ message: 'Failed to set Instagram username', error }, 500)
	}
}

const userRouter = new Hono()

userRouter.get('/:id', getUserFullData)
userRouter.get('/:id/instagram', setUserInstagram)

export default userRouter
