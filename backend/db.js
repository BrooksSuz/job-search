import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Site from './schemas/Site.js';
import User from './schemas/User.js';
import logger from '../logger.js';
dotenv.config();

const uri = process.env.MONGO_URI;
const db = process.env.DB;
async function connectToDb() {
  try {
    await mongoose.connect(uri, {
      dbName: db,
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
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
    console.error('Error in function getPremadeConfigs:', err);
  }
}

async function getSelectedConfigs(arrIds) {
  try {
    const arrConfigs = await Site.find({ _id: { $in: arrIds } }, { _id: 0 });
    return arrConfigs;
  } catch (err) {
    console.error('Error in function getSelectedConfigs:', err);
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
    console.error('Error in function deleteUser:', err);
  } finally {
    await session.endSession();
  }
}

// Connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected.');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

export {
  connectToDb,
  deleteUser,
  getPremadeConfigs,
  getSelectedConfigs,
  mongoose,
};
