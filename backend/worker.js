import Queue from 'bull';
import dotenv from 'dotenv';
import scrapeListings from './scrape-listings/scrape-listings.js';
import logger from './logger-backend.js';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const channelName = process.env.CHANNEL_NAME;
const pubClient = createClient({
  url: redisUrl,
});
const queueName =
  process.env.NODE_ENV === 'production' ? 'prodUserQueue' : 'devUserQueue';
  
pubClient.connect().catch(console.error);
  
const userQueue = new Queue(queueName, redisUrl);

userQueue.process(20, async (job) => {
  const { keywords, objConfig } = job.data;
  const jobId = job.id;
  const interval = setInterval(() => {
    pubClient.publish(
      channelName,
      JSON.stringify({ jobId, status: 'in progress' })
    );
  }, 5000);

  try {
    const listings = await scrapeListings(keywords, objConfig);
    clearInterval(interval);
    return listings;
  } catch (err) {
    clearInterval(interval);
    logger.error(`Error processing job ${jobId}:\n${err}`);
    pubClient.publish(
      channelName,
      JSON.stringify({ jobId, status: 'failed', error: err.message })
    );
    throw new Error('Job processing failed');
  }
});

userQueue.on('completed', async (job, result) => {
  const jobId = job.id;
  pubClient.publish(
    channelName,
    JSON.stringify({ jobId, status: 'completed', result })
  );
});

userQueue.on('failed', (job, err) => {
  const jobId = job.id;
  pubClient.publish(
    channelName,
    JSON.stringify({ jobId, status: 'failed', error: err.message })
  );
});
