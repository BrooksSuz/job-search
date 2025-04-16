import Queue from 'bull';
import dotenv from 'dotenv';
import scrapeListings from './scrape-listings/scrape-listings.js';
import Redis from 'ioredis';
import { logger, loggerFlexLogs } from './logger-backend.js';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const channelName = process.env.CHANNEL_NAME;
const pubClient = new Redis(redisUrl);
const queueName =
	process.env.NODE_ENV === 'production' ? 'prodUserQueue' : 'devUserQueue';
const userQueue = new Queue(queueName, redisUrl);

userQueue.process(20, async (job) => {
	const { keywords, objConfig } = job.data;
	const jobId = job.id;

	try {
    const listings = await scrapeListings(keywords, objConfig);

		return listings;
	} catch (err) {
		logger.error(`Error processing job ${jobId}:\n${err}`);
		pubClient.publish(
			channelName,
			JSON.stringify({ jobId, status: 'failed', error: err.message })
		);
		throw new Error('Job processing failed');
	}
});

const logQueueLength = async () => {
  const jobCount = await userQueue.count();

  loggerFlexLogs.info(
    `flexlogs{metric: 'queue.length', value: ${jobCount}, type: 'gauge'}`
  );
};

userQueue.on('waiting', async () => {
  await logQueueLength();
})

userQueue.on('completed', async (job, result) => {
  const jobId = job.id;
  
	pubClient.publish(
		channelName,
		JSON.stringify({ jobId, status: 'completed', result })
  );

  await logQueueLength();
});

userQueue.on('failed', async (job, err) => {
  const jobId = job.id;
  
	pubClient.publish(
		channelName,
		JSON.stringify({ jobId, status: 'failed', error: err.message })
  );
  
  await logQueueLength();
});
