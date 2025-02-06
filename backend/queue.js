import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = `redis://${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const queueName =
	process.env.NODE_ENV === 'production' ? 'prodUserQueue' : 'devUserQueue';
const userQueue = new Queue(queueName, redisUrl, {
	defaultJobOptions: {
		timeout: 300000,
	},
});

export default userQueue;
