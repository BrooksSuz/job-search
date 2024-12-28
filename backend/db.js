// db.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Site from './schemas/Site.js';
import User from './schemas/User.js';
import logger from './logger-backend.js';
import { SocksProxyAgent } from 'socks-proxy-agent';
dotenv.config();

const uri = process.env.MONGO_URI;
const db = process.env.DB;
const fixieData = process.env.FIXIE_SOCKS_HOST.split(new RegExp('[/(:\\/@/]+'));

const fixieUrl = `socks5://${fixieData[0]}:${fixieData[1]}@${fixieData[2]}:${fixieData[3]}`;
const socksAgent = new SocksProxyAgent(fixieUrl);

// Connect to MongoDB without passing the agent
async function connectToDb() {
	try {
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			dbName: db,
		});
		logger.info('Connected to MongoDB');
	} catch (err) {
		logger.error(`Error connecting to MongoDB: ${err}`);
		process.exit(1);
	}
}

async function getPremadeConfigs() {
	const arrPremade = [
		'6757a5bfe3bdb76056b5beae',
		'6757a5bfe3bdb76056b5beac',
		'6757a5bfe3bdb76056b5beb0',
		'6757a5bfe3bdb76056b5beaf',
		'6757a5bfe3bdb76056b5bead',
		'67584b92e3bdb76056b635f7',
	];
	try {
		const arrConfigs = await Site.find({ _id: { $in: arrPremade } }).sort({
			siteName: 1,
		});

		return arrConfigs;
	} catch (err) {
		logger.error('Error in function getPremadeConfigs:', err);
	}
}

async function getSelectedConfigs(arrIds) {
	try {
		const arrConfigs = await Site.find({ _id: { $in: arrIds } });
		return arrConfigs;
	} catch (err) {
		logger.error('Error in function getSelectedConfigs:', err);
	}
}

async function deleteUser(user) {
	const { _id, sites } = user;
	const session = await mongoose.startSession();
	try {
		session.startTransaction();

		await Site.deleteMany({
			_id: { $in: sites },
		}).session(session);

		const userResult = await User.findByIdAndDelete(_id).session(session);

		if (!userResult) throw new Error('User not found.');

		await session.commitTransaction();
	} catch (err) {
		await session.abortTransaction();
		logger.error('Error in function deleteUser:', err);
	} finally {
		await session.endSession();
	}
}

// Connection events
mongoose.connection.on('error', (err) => {
	logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
	logger.info('\nMongoose disconnected');
});

process.on('SIGINT', () => {
	mongoose.connection.close(() => {
		logger.info('\nMongoose disconnected through app termination');
		process.exit(0);
	});
});

process.on('SIGTERM', () => {
	logger.info('SIGTERM received. Closing server...');
	app.close(() => {
		logger.info('Server closed.');
		mongoose.connection.close(() => {
			logger.info('MongoDB connection closed.');
			process.exit(0);
		});
	});
});

export {
	connectToDb,
	deleteUser,
	getPremadeConfigs,
	getSelectedConfigs,
	mongoose,
	socksAgent,
};
