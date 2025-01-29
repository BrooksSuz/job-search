import Queue from 'bull';
import dotenv from 'dotenv';
import scrapeListings from './scrape-listings/scrape-listings.js';
import { clients } from './server.js';
import logger from './logger-backend.js';

dotenv.config();

const redisUrl = `redis://${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const userQueue = new Queue('myQueue1', redisUrl);

userQueue.process(async (job) => {
	const { keywords, objConfig } = job.data;

	try {
		const listings = await scrapeListings(keywords, objConfig);
		return listings;
	} catch (err) {
		logger.error(`Error processing job ${job.id}:\n${err}`);
		throw new Error('Job processing failed');
	}
});

userQueue.on('completed', (job, result) => {
	clients.forEach((client) => {
		if (client.readyState === 1) {
			client.send(
				JSON.stringify({ jobId: job.id, status: 'completed', result })
			);
		}
	});
});

userQueue.on('failed', (job, err) => {
	clients.forEach((client) => {
		if (client.readyState === 1) {
			client.send(
				JSON.stringify({ jobId: job.id, status: 'failed', error: err.message })
			);
		}
	});
});

export default userQueue;
