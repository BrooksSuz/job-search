import Queue from 'bull';
import dotenv from 'dotenv';
import scrapeListings from './scrape-listings/scrape-listings.js';
import { clients } from './server.js';
import logger from './logger-backend.js';

dotenv.config();

const redisUrl = `redis://${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

let lastQueueCreationTime = 0;
let userQueue = null;
const createUserQueue = () => {
	const currentTime = Date.now();

	if (!userQueue || currentTime - lastQueueCreationTime > 5000) {
		const random = `${Math.floor(Math.random() * 1000)}`;
		const queueName =
			process.env.NODE_ENV === 'production'
				? `prod-${random}`
				: `dev-${random}`;

		userQueue = new Queue(queueName, redisUrl, {
			defaultJobOptions: {
				timeout: 300000,
			},
		});
	}

	lastQueueCreationTime = currentTime;

	userQueue.process(10, async (job) => {
		const { keywords, objConfig } = job.data;
		const jobId = job.id;
		const interval = setInterval(() => {
			clients.forEach((client) => {
				if (client.readyState === 1) {
					client.send(JSON.stringify({ jobId, status: 'in progress' }));
				}
			});
		}, 5000);

		try {
			const listings = await scrapeListings(keywords, objConfig);
			clearInterval(interval);
			return listings;
		} catch (err) {
			clearInterval(interval);
			logger.error(`Error processing job ${job.id}:\n${err}`);
			throw new Error('Job processing failed');
		}
	});

	userQueue.on('completed', async (job, result) => {
		clients.forEach((client) => {
			if (client.readyState === 1) {
				client.send(
					JSON.stringify({ jobId: job.id, status: 'completed', result })
				);
			}
		});

		const activeCount = await userQueue.getActiveCount();
		if (!activeCount) await userQueue.obliterate();
	});

	userQueue.on('failed', (job, err) => {
		clients.forEach((client) => {
			if (client.readyState === 1) {
				client.send(
					JSON.stringify({
						jobId: job.id,
						status: 'failed',
						error: err.message,
					})
				);
			}
		});
	});

	return userQueue;
};

export default createUserQueue;
