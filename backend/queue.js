import Queue from 'bull';
import Redis from 'ioredis';
import scrapeListings from './scrape-listings/scrape-listings.js';
import logger from './logger-backend.js';

const redis = new Redis(process.env.REDIS_URL);

const myQueue = new Queue('myQueue', {
	redis: {
		host: redis.options.host,
		port: redis.options.port,
		password: redis.options.password,
	},
});

myQueue.process(async (job) => {
	const { keywords, objConfig } = job.data;

	try {
		const listings = await scrapeListings(keywords, objConfig);
		return listings;
	} catch (err) {
		logger.error(`Error processing job ${job.id}:\n${err}`);
		throw new Error('Job processing failed');
	}
});

myQueue.on('completed', (job, result) => {
	logger.info(`Job ${job.id} completed successfully with result:`, result);
});

myQueue.on('failed', (job, err) => {
	logger.error(`Job ${job.id} failed with error: ${err.message}`);
});

myQueue.on('progress', (job, progress) => {
	logger.info(`Job ${job.id} is ${progress}% complete`);
});

export default myQueue;
