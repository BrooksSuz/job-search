import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Site from './schemas/Site.js';
dotenv.config();

const uri = process.env.MONGO_URI;

const collection = process.env.COLLECTION;
async function connectToDb() {
  try {
    await mongoose.connect(uri, {
      dbName: collection,
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

async function insertSite(objUserData) {
  try {
    const site = new Site(objUserData);
    const result = await site.save();
    console.log('Site inserted with _id:', result.id);
  } catch (err) {
    console.error('Error inserting site:', err);
  }
}

async function getPremadeConfigs() {
  const arrPremade = [
    '6757a5bfe3bdb76056b5beac',
    '6757a5bfe3bdb76056b5bead',
    '6757a5bfe3bdb76056b5beae',
    '6757a5bfe3bdb76056b5beaf',
    '6757a5bfe3bdb76056b5beb0',
    '67584b92e3bdb76056b635f7',
  ];
  try {
    const arrConfigs = Site.find({ _id: { $in: arrPremade } });
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

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + uri);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error: ' + err);
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

export {
  connectToDb,
  getPremadeConfigs,
  getSelectedConfigs,
  insertSite,
  mongoose,
};
