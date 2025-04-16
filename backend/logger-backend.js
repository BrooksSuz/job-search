import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino({
	level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
	transport:
		process.env.NODE_ENV !== 'production'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
			  }
			: undefined,
});

const loggerFlexLogs = pino({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	transport:
		process.env.NODE_ENV !== 'production'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
			  }
			: undefined,
});

export { logger, loggerFlexLogs };
