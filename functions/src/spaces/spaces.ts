import { config } from 'dotenv'

// Load environment variables
config()

interface Space {
	name: string
	followedUsername: string
	followerSinceStampContractAddress: string
}

function getSpaces(): Space[] {
	const space1 = JSON.parse(process.env.SPACE1 || '{}') as Space
	const space2 = JSON.parse(process.env.SPACE2 || '{}') as Space

	return [space1, space2].filter((space) => Object.keys(space).length > 0)
}

export const spaces = getSpaces()
