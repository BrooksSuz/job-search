import Queue from 'bull';
import scrapeListings from './scrape-listings/scrape-listings.js';
import logger from './logger-backend.js';
import dotenv from 'dotenv';

dotenv.config();

const myQueue = new Queue('myQueue', process.env.REDIS_URL, {
	redis: {
		port: process.env.REDIS_PORT,
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PASSWORD,
	}
});

export default myQueue;
