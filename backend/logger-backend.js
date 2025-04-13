import dotenv from 'dotenv';
import pino from 'pino';
dotenv.config();

const logger = pino({
	level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
	transport: {
		target:
			process.env.NODE_ENV !== 'production' ? 'pino-pretty' : 'pino/transport',
		options: {
			colorize: true,
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
		},
	},
});

const loggerFlexLogs = pino({
	level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
	transport: {
		target:
			process.env.NODE_ENV !== 'production' ? 'pino-pretty' : 'pino/transport',
		options: {
			colorize: true,
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
		},
	},
});

export { logger, loggerFlexLogs };
