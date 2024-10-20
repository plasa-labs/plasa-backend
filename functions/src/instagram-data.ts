import { UserData, StampSignature } from './return-interfaces'
import { getLinkedInstagram } from './database/get-instagram'
import { generateInstagramStampSignatures } from './stamps-signatures'
import { getStampsByContractAddresses, getAllExistingStamps } from './database/stamps'

async function getUserDataFromInstagram(
	userAddress: string,
	stampContractAddresses?: string[]
): Promise<UserData> {
	const instagramUsername = await getLinkedInstagram(userAddress)

	if (!instagramUsername) {
		return {
			address: userAddress,
			instagramUsername: null,
			availableStamps: null
		}
	}

	// Get stamps based on whether stampContractAddresses is provided
	const stamps = stampContractAddresses
		? await getStampsByContractAddresses(stampContractAddresses)
		: await getAllExistingStamps()

	const stampSignatures: StampSignature[] = await generateInstagramStampSignatures(
		userAddress,
		instagramUsername,
		stamps
	)

	return {
		address: userAddress,
		instagramUsername,
		availableStamps: stampSignatures
	}
}

export { getUserDataFromInstagram }
