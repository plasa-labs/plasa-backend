import { Hono, Context } from 'hono'
import UserService from './service'
import { UserFullData } from './model'

const userService = new UserService()

/**
 * Retrieves full data for a user.
 * @param ctx - The context object containing the request and response.
 */
export async function getUserFullData(ctx: Context) {
	try {
		const userId = ctx.req.param('id')
		const userFullData: UserFullData = await userService.getUserFullData(userId)
		ctx.json(userFullData)
	} catch (error) {
		ctx.json({ message: 'Failed to retrieve user data', error }, 500)
	}
}

/**
 * Sets the Instagram username for a user.
 * @param ctx - The context object containing the request and response.
 */
export async function setUserInstagram(ctx: Context) {
	try {
		const { userId, instagramUsername } = await ctx.req.json()
		const updatedUserFullData: UserFullData | null = await userService.setUserInstagram(
			userId,
			instagramUsername
		)
		ctx.json(updatedUserFullData)
	} catch (error) {
		ctx.json({ message: 'Failed to set Instagram username', error }, 500)
	}
}

const userRouter = new Hono()

userRouter.get('/:id', getUserFullData)
userRouter.post('/instagram', setUserInstagram)

export default userRouter
