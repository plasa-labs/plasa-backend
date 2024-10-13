import { config } from 'dotenv'

// Load environment variables from .env file
config()

/**
 * Represents a space with its properties.
 */
interface Space {
	name: string
	followedUsername: string
	followerSinceStampContractAddress: string
}

/**
 * Retrieves the spaces from environment variables.
 * @returns An array of Space objects.
 */
function getSpaces(): Space[] {
	// Parse space data from environment variables
	const space1 = JSON.parse(process.env.SPACE1 || '{}') as Space
	const space2 = JSON.parse(process.env.SPACE2 || '{}') as Space

	// Filter out empty spaces and return the valid ones
	const result = [space1, space2].filter((space) => Object.keys(space).length > 0)

	// Log the result for verification
	console.log('Parsed spaces:', result)

	return result
}

// Export the spaces array for use in other modules
export const spaces = getSpaces()

// Log the exported spaces
console.log('Exported spaces:', spaces)
