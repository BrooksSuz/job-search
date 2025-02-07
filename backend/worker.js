import Queue from 'bull';
import dotenv from 'dotenv';
import scrapeListings from './scrape-listings/scrape-listings.js';
import logger from './logger-backend.js';
import { createClient } from 'redis';

dotenv.config();

const redisClient = createClient({
	username: 'default',
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	},
	defaultJobOptions: {
		timeout: 300000,
	},
});
const CHANNEL_NAME = 'job_updates';
const queueName =
	process.env.NODE_ENV === 'production' ? 'prodUserQueue' : 'devUserQueue';
const userQueue = new Queue(queueName, redisClient);

redisClient.connect().catch(console.error);

userQueue.process(20, async (job) => {
	const { keywords, objConfig } = job.data;
	const jobId = job.id;
	const interval = setInterval(() => {
		redisClient.publish(
			CHANNEL_NAME,
			JSON.stringify({ jobId, status: 'in progress' })
		);
	}, 5000);

	try {
		const listings = await scrapeListings(keywords, objConfig);
		clearInterval(interval);
		return listings;
	} catch (err) {
		clearInterval(interval);
		logger.error(`Error processing job ${job.id}:\n${err}`);
		redisClient.publish(
			CHANNEL_NAME,
			JSON.stringify({ jobId, status: 'failed', error: err.message })
		);
		throw new Error('Job processing failed');
	}
});

userQueue.on('completed', async (job, result) => {
	const jobId = job.id;
	redisClient.publish(
		CHANNEL_NAME,
		JSON.stringify({ jobId, status: 'completed', result })
	);
});

userQueue.on('failed', (job, err) => {
	const jobId = job.id;
	redisClient.publish(
		CHANNEL_NAME,
		JSON.stringify({ jobId, status: 'failed', error: err.message })
	);
});
