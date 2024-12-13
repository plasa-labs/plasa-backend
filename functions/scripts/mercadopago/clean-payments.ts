import * as path from 'path'
import * as fs from 'fs/promises'
import * as dotenv from 'dotenv'

dotenv.config()

interface ChargeDetail {
	amounts: {
		original: number
		refunded: number
	}
	name: string
	type: string
}

interface CleanedPayment {
	captured: boolean
	charges_details: Array<ChargeDetail>
	collector_id: number
	currency_id: string
	date_approved: string
	date_created: string
	date_last_updated: string
	description: string
	fee_details: Array<{
		amount: number
		fee_payer: string
		type: string
	}>
	id: number
	live_mode: boolean
	money_release_date: string
	money_release_status: string
	operation_type: string
	payment_type_id: string
	point_of_interaction: {
		business_info: {
			branch: string
			sub_unit: string
			unit: string
		}
		type: string
	}
	refunds: Array<unknown>
	status: string
	status_detail: string
	taxes_amount: number
	transaction_amount: number
	transaction_amount_refunded: number
	transaction_details: {
		installment_amount: number
		net_received_amount: number
		overpaid_amount: number
		total_paid_amount: number
	}
}

if (!process.env.MP_USER_ID) {
	throw new Error('MP_USER_ID environment variable is not set')
}

const collectionId = `mp-payments-${process.env.MP_USER_ID}`

async function cleanMercadoPagoPayments(): Promise<void> {
	const inputFolder = collectionId + '-raw'
	const outputFolder = collectionId

	const inputDir = path.join(__dirname, '..', '..', 'data', inputFolder)
	const outputDir = path.join(__dirname, '..', '..', 'data', outputFolder)

	try {
		// Create output directory if it doesn't exist
		await fs.mkdir(outputDir, { recursive: true })

		// Read all files in the input directory
		const files = await fs.readdir(inputDir)
		const jsonFiles = files.filter((file) => file.endsWith('.json'))

		console.log(`Found ${jsonFiles.length} JSON files to process`)
		let processedCount = 0

		for (const file of jsonFiles) {
			try {
				const inputPath = path.join(inputDir, file)
				const outputPath = path.join(outputDir, file)

				// Read and parse the original payment file
				const rawData = await fs.readFile(inputPath, 'utf-8')
				const payment = JSON.parse(rawData)

				// Create cleaned payment object with only the fields we want to keep
				const cleanedPayment: CleanedPayment = {
					captured: payment.captured,
					charges_details: payment.charges_details.map((charge: ChargeDetail) => ({
						amounts: {
							original: charge.amounts.original,
							refunded: charge.amounts.refunded
						},
						name: charge.name,
						type: charge.type
					})),
					collector_id: payment.collector_id,
					currency_id: payment.currency_id,
					date_approved: payment.date_approved,
					date_created: payment.date_created,
					date_last_updated: payment.date_last_updated,
					description: payment.description,
					fee_details: payment.fee_details,
					id: payment.id,
					live_mode: payment.live_mode,
					money_release_date: payment.money_release_date,
					money_release_status: payment.money_release_status,
					operation_type: payment.operation_type,
					payment_type_id: payment.payment_type_id,
					point_of_interaction: {
						business_info: {
							branch: payment.point_of_interaction.business_info.branch,
							sub_unit: payment.point_of_interaction.business_info.sub_unit,
							unit: payment.point_of_interaction.business_info.unit
						},
						type: payment.point_of_interaction.type
					},
					refunds: payment.refunds,
					status: payment.status,
					status_detail: payment.status_detail,
					taxes_amount: payment.taxes_amount,
					transaction_amount: payment.transaction_amount,
					transaction_amount_refunded: payment.transaction_amount_refunded,
					transaction_details: {
						installment_amount: payment.transaction_details.installment_amount,
						net_received_amount: payment.transaction_details.net_received_amount,
						overpaid_amount: payment.transaction_details.overpaid_amount,
						total_paid_amount: payment.transaction_details.total_paid_amount
					}
				}

				// Write the cleaned payment to the output directory
				await fs.writeFile(outputPath, JSON.stringify(cleanedPayment, null, 2), 'utf-8')

				processedCount++
				if (processedCount % 100 === 0) {
					console.log(`Processed ${processedCount} files`)
				}
			} catch (error) {
				console.error(`Error processing file ${file}:`, error)
			}
		}

		console.log(`Successfully processed ${processedCount} files`)
		console.log(`Clean files saved to: ${outputDir}`)
	} catch (error) {
		console.error('Error cleaning payment files:', error)
		throw error
	}
}

// Run the script
void cleanMercadoPagoPayments()
