import Queue from 'bull';
import dotenv from 'dotenv';
import scrapeListings from './scrape-listings/scrape-listings.js';

dotenv.config();

const myQueue = new Queue('myQueue', process.env.REDIS_URL, {
	redis: {
		port: process.env.REDIS_PORT,
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PASSWORD,
	}
});

myQueue.process(async (job) => {
  const { keywords, objConfig } = job.data;

  try {
    logger.info(`Processing job ${job.id} with keywords: ${keywords}`);
    const listings = await scrapeListings(keywords, objConfig);
    return listings;
  } catch (err) {
    logger.error(`Error processing job ${job.id}:\n${err}`);
    throw new Error('Job processing failed');
  }
});

myQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed successfully.`);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      logger.info(`Sending completion message to client for job ${job.id}`);
      client.send(
        JSON.stringify({ jobId: job.id, status: 'completed', result })
      );
    }
  });
});

myQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed with error: ${err.message}`);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({ jobId: job.id, status: 'failed', error: err.message })
      );
    }
  });
});

myQueue.on('progress', (job, progress) => {
  logger.info(`Job ${job.id} is ${progress}% complete`);
});

export default myQueue;
