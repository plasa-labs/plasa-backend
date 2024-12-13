import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs/promises'
import axios from 'axios'

dotenv.config()

// Validate required environment variables
if (!process.env.MP_ACCESS_TOKEN) {
	throw new Error('MP_ACCESS_TOKEN environment variable is not set')
}

if (!process.env.MP_USER_ID) {
	throw new Error('MP_USER_ID environment variable is not set')
}

if (!process.env.MP_FETCH_START_DATE) {
	throw new Error('MP_FETCH_START_DATE environment variable is not set')
}

interface PayerIdentification {
	type: string | null
	number: number | null
}

interface Payer {
	id: number | null
	email: string | null
	identification: PayerIdentification | null
	type: string | null
}

interface TransactionDetails {
	net_received_amount: number | null
	total_paid_amount: number | null
	overpaid_amount: number | null
	installment_amount: number | null
}

interface MercadoPagoPayment {
	id: number
	date_created: string
	date_approved: string | null
	date_last_updated: string | null
	money_release_date: string | null
	payment_method_id: string | null
	payment_type_id: string | null
	status: string
	status_detail: string | null
	currency_id: string | null
	description: string | null
	collector_id: number | null
	payer: Payer | null
	metadata: Record<string, unknown>
	additional_info: Record<string, unknown>
	external_reference?: string | null
	transaction_amount: number | null
	transaction_amount_refunded: number | null
	coupon_amount: number | null
	transaction_details: TransactionDetails | null
	installments: number | null
	card: Record<string, unknown> | null
	[key: string]: unknown
}

async function fetchMercadoPagoPayments(startDate: string): Promise<void> {
	let currentStartDate = startDate
	const batchSize = 10000
	let hasMorePayments = true
	let totalPaymentsSaved = 0
	const processedPaymentIds = new Set<number>()
	const MAX_PAGES = 100 // Maximum number of pages to fetch

	try {
		while (hasMorePayments) {
			console.log(`Fetching batch starting from date: ${currentStartDate}`)
			const batchPayments: MercadoPagoPayment[] = []
			let offset = 0
			const limit = 100 // MP's max limit per request
			let currentPage = 0

			// Add a safety check for maximum payments and pages
			while (batchPayments.length < batchSize && currentPage < MAX_PAGES) {
				currentPage++
				console.log(`Fetching page ${currentPage} of maximum ${MAX_PAGES} pages`)

				const response = await axios.get('https://api.mercadopago.com/v1/payments/search', {
					headers: {
						Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
					},
					params: {
						begin_date: currentStartDate,
						end_date: new Date().toISOString(),
						range: 'date_created',
						offset,
						limit
					}
				})

				const { results, paging } = response.data

				// Filter out already processed payments
				const newResults = results.filter(
					(payment: MercadoPagoPayment) => !processedPaymentIds.has(payment.id)
				)

				// Save this page of results immediately
				if (newResults.length > 0) {
					await savePaymentsToFiles(newResults)
					totalPaymentsSaved += newResults.length

					// Add processed payment IDs to the set
					newResults.forEach((payment: MercadoPagoPayment) => {
						processedPaymentIds.add(payment.id)
					})

					console.log(
						`Saved page ${currentPage} with ${newResults.length} payments. Total saved: ${totalPaymentsSaved}`
					)
				}

				batchPayments.push(...newResults)

				// Log the date range for debugging
				if (newResults.length > 0) {
					const firstPayment = newResults[0]
					const lastPayment = newResults[newResults.length - 1]
					console.log(`Page ${currentPage} date range:`)
					console.log(`  First: ${firstPayment.date_created}`)
					console.log(`  Last: ${lastPayment.date_created}`)
				}

				// Check if we've reached the end of available payments
				if (offset + limit >= paging.total || results.length === 0) {
					hasMorePayments = false
					break
				}

				// Check if we've reached the batch size limit
				if (batchPayments.length >= batchSize) {
					console.log(`Reached batch size limit of ${batchSize} payments`)
					break
				}

				offset += limit
				console.log(
					`Fetched ${batchPayments.length} of ${Math.min(batchSize, paging.total)} payments in current batch`
				)

				// Add a small delay to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 100))
			}

			// Check if we've reached the maximum number of pages
			if (currentPage >= MAX_PAGES) {
				console.log(`Reached maximum number of pages (${MAX_PAGES}). Starting new batch.`)
				hasMorePayments = true // Ensure we continue with a new batch
			}

			if (batchPayments.length > 0) {
				// Update the start date for the next batch using the last payment's date
				const lastPayment = batchPayments[batchPayments.length - 1]
				currentStartDate = lastPayment.date_created
				console.log(`Next batch will start from: ${currentStartDate}\n`)
			}

			console.log(`Total payments fetched and saved so far: ${totalPaymentsSaved}`)
		}
	} catch (error) {
		console.error('Error fetching payments:', error)
		throw error
	}
}

async function savePaymentsToFiles(payments: MercadoPagoPayment[]): Promise<void> {
	const folderName = `mp-payments-${process.env.MP_USER_ID}-raw`

	const outputDir = path.join(__dirname, '..', '..', 'data', folderName)

	try {
		// Create output directory if it doesn't exist
		await fs.mkdir(outputDir, { recursive: true })

		let savedCount = 0
		for (const payment of payments) {
			const fileName = `${payment.id}.json`
			const filePath = path.join(outputDir, fileName)

			await fs.writeFile(filePath, JSON.stringify(payment, null, 2), 'utf-8')

			savedCount++
			if (savedCount % 100 === 0) {
				console.log(`Saved ${savedCount} of ${payments.length} payment files`)
			}
		}

		console.log('Payment data files saved successfully!')
		console.log(`Total payments saved: ${savedCount}`)
		console.log(`Output directory: ${outputDir}`)
	} catch (error) {
		console.error('Error saving payment files:', error)
		throw error
	}
}

async function main() {
	try {
		// Format: YYYY-MM-DD
		const startDate = new Date(process.env.MP_FETCH_START_DATE!).toISOString()
		console.log(`Fetching payments since ${startDate}...`)

		await fetchMercadoPagoPayments(startDate)
		console.log('Finished processing all payments')
	} catch (error) {
		console.error('Script execution failed:', error)
	}
}

void main()
