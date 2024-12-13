import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

interface Payment {
	id: number
	date_created: string
	status: string
	operation_type: string
	payment_method?: {
		id?: string
		type?: string
	}
	transaction_amount: number
	transaction_details: {
		net_received_amount: number
	}
	captured: boolean
}

interface DailyStats {
	date: string
	paymentCount: number
	grossAmount: number
	netAmount: number
}

const collectionId = `mp-payments-${process.env.MP_USER_ID}`

// Add CSV header writing function
function writeCSVHeader(filePath: string): void {
	const header = 'date,paymentCount,grossAmount,netAmount\n'
	fs.writeFileSync(filePath, header)
}

// Add CSV row writing function
function appendCSVRow(filePath: string, data: DailyStats): void {
	const row = `${data.date},${data.paymentCount},${data.grossAmount},${data.netAmount}\n`
	fs.appendFileSync(filePath, row)
}

function analyzePayments(): void {
	console.log('\n=== Starting Payment Analysis ===')

	const directoryPath = path.join(__dirname, '../../data', collectionId)
	console.log(`Reading files from: ${directoryPath}`)

	const dailyStats: { [key: string]: DailyStats } = {}
	const paymentMethodStats: { [key: string]: number } = {}

	// Read all files in the directory
	const files = fs.readdirSync(directoryPath)
	console.log(`Found ${files.length} files in directory`)

	let processedFiles = 0
	let skippedFiles = 0
	let approvedPayments = 0
	let rejectedPayments = 0

	files.forEach((file) => {
		if (!file.endsWith('.json')) return

		try {
			const filePath = path.join(directoryPath, file)
			const fileContent = fs.readFileSync(filePath, 'utf-8')
			const payment: Payment = JSON.parse(fileContent)

			// Get payment method type safely
			const paymentMethodType = payment.payment_method?.type || 'unknown'

			// Update payment method stats
			paymentMethodStats[paymentMethodType] = (paymentMethodStats[paymentMethodType] || 0) + 1

			// Rest of your processing logic...
			const date = payment.date_created.split('T')[0]

			if (!dailyStats[date]) {
				dailyStats[date] = {
					date,
					paymentCount: 0,
					grossAmount: 0,
					netAmount: 0
				}
			}

			dailyStats[date].paymentCount++
			dailyStats[date].grossAmount += payment.transaction_amount
			dailyStats[date].netAmount += payment.transaction_details.net_received_amount

			if (payment.status === 'approved') {
				approvedPayments++
			} else if (payment.status === 'rejected') {
				rejectedPayments++
			}

			processedFiles++
		} catch (error) {
			console.error(`Error processing file ${file}:`, error)
			skippedFiles++
		}
	})

	// Add progress separator before statistics
	console.log('\n=== Processing Complete ===')

	// Output statistics
	console.log('\n=== Processing Statistics ===')
	console.log(`Total files processed: ${processedFiles}`)
	console.log(`Files skipped: ${skippedFiles}`)
	console.log(`Approved payments: ${approvedPayments}`)
	console.log(`Rejected payments: ${rejectedPayments}`)

	console.log('\n=== Payment Methods ===')
	Object.entries(paymentMethodStats).forEach(([method, count]) => {
		console.log(`${method}: ${count} payments`)
	})

	// After processing all files and before writing to CSV, add this code:
	console.log('\n=== Filling Missing Dates ===')

	// Find min and max dates
	const dates = Object.keys(dailyStats).sort()
	const startDate = new Date(dates[0])
	const endDate = new Date(dates[dates.length - 1])

	// Fill in missing dates
	for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toISOString().split('T')[0]
		if (!dailyStats[dateStr]) {
			dailyStats[dateStr] = {
				date: dateStr,
				paymentCount: 0,
				grossAmount: 0,
				netAmount: 0
			}
		}
	}

	// Convert to array and sort by date
	console.log('\n=== Sorting and Preparing Output ===')
	const sortedStats = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date))
	console.log(`Processed data for ${sortedStats.length} unique dates`)

	// Write results to file
	const outputPath = path.join(__dirname, '../../data/payment-analytics.csv')
	writeCSVHeader(outputPath)
	sortedStats.forEach((data) => appendCSVRow(outputPath, data))
	console.log(`\nAnalytics data written to: ${outputPath}`)

	// Calculate and log summary statistics
	const totalPayments = sortedStats.reduce((sum, day) => sum + day.paymentCount, 0)
	const totalGross = sortedStats.reduce((sum, day) => sum + day.grossAmount, 0)
	const totalNet = sortedStats.reduce((sum, day) => sum + day.netAmount, 0)

	console.log('\n=== Final Summary ===')
	console.log(`Total number of payments: ${totalPayments}`)
	console.log(`Total gross amount: $${totalGross.toFixed(2)}`)
	console.log(`Total net amount: $${totalNet.toFixed(2)}`)
	console.log(`Average transaction size: $${(totalGross / totalPayments).toFixed(2)}`)
	console.log(`Average daily payments: ${(totalPayments / sortedStats.length).toFixed(1)}`)
	console.log('=== Analysis Complete ===\n')
}

// Run the analysis
try {
	analyzePayments()
} catch (error) {
	console.error('Error analyzing payments:', error)
}
