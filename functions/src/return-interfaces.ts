import { Stamp } from './database/stamps'

interface StampSignature {
	signature: string
	deadline: number
	since: number
	stamp: Stamp
	authentic: boolean
}

interface UserData {
	address: string
	instagramUsername?: string | null
	availableStamps?: StampSignature[] | null
}

export { StampSignature, UserData }
