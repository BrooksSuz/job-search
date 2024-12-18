import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Site from './schemas/Site.js';
import User from './schemas/User.js';
dotenv.config();

const uri = process.env.MONGO_URI;

const collection = process.env.COLLECTION;
async function connectToDb() {
  try {
    await mongoose.connect(uri, {
      dbName: collection,
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
    const arrConfigs = Site.find({ _id: { $in: arrPremade } }).sort({
      siteName: 1,
    });
    return arrConfigs;
  } catch (err) {
    console.error('Error querying site configs:', err);
  }
}

async function getSelectedConfigs(arrIds) {
  try {
    const arrConfigs = await Site.find({ _id: { $in: arrIds } }, { _id: 0 });
    return arrConfigs;
  } catch (err) {
    console.error('Error querying site config:', err);
  }
}
// TODO: MAKE SURE THIS WORKS
async function deleteUser(user) {
  const { _id, email, sites } = user;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const sitesResult = await Site.deleteMany({
      _id: { $in: sites },
    }).session(session);

    if (!sitesResult.deletedCount === 0) {
      console.log('No sites were deleted.');
      return;
    }

    const userResult = await User.findByIdAndDelete(_id).session(session);

    if (!userResult) {
      console.log('User not found.');
      return;
    }

    console.log('User deleted successfully');
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error('Error deleting user:', err);
  } finally {
    await session.endSession();
  }
}

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected.');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

export { connectToDb, getPremadeConfigs, getSelectedConfigs, mongoose };
