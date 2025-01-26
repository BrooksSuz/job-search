import Queue from 'bull';
import scrapeListings from './scrape-listings/scrape-listings.js'; // Import your scraping function
import logger from './logger-backend.js'; // Assuming you have a logger

// Create a new queue
const myQueue = new Queue('myQueue', {
	redis: {
		host: process.env.REDIS_HOST || '127.0.0.1', // Use environment variable or default to localhost
		port: process.env.REDIS_PORT || 6379, // Use environment variable or default to 6379
	},
});

// Process jobs in the queue
myQueue.process(async (job) => {
	const { keywords, objConfig } = job.data;

	try {
		// Call the scraping function with the provided keywords and configuration
		const listings = await scrapeListings(keywords, objConfig);

		// Return the result, which will be available when the job is completed
		return listings;
	} catch (err) {
		logger.error(`Error processing job ${job.id}:\n${err}`);
		throw new Error('Job processing failed'); // This will mark the job as failed
	}
});

// Optional: Listen for completed jobs
myQueue.on('completed', (job, result) => {
	logger.info(`Job ${job.id} completed successfully with result:`, result);
});

// Optional: Listen for failed jobs
myQueue.on('failed', (job, err) => {
	logger.error(`Job ${job.id} failed with error: ${err.message}`);
});

// Optional: Listen for progress updates
myQueue.on('progress', (job, progress) => {
	logger.info(`Job ${job.id} is ${progress}% complete`);
});

// Export the queue for use in other files
export default myQueue;
