import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDb(strCollection = '') {
  try {
    await mongoose.connect(uri, {
      dbName: strCollection,
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

async function insertSite(objUserData) {
  try {
    await client.connect();
    const db = client.db('job_scraper');
    const collection = db.collection('sites');

    const result = await collection.insertOne(objUserData);
    console.log('Site inserted with _id:', result.insertedId);
  } catch (err) {
    console.error('Error inserting site:', err);
  } finally {
    await client.close();
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
  const arrConverted = arrPremade.map((id) => ObjectId.createFromHexString(id));
  try {
    await client.connect();
    const db = client.db('job_scraper');
    const collection = db.collection('sites');
    const arrConfigs = await collection
      .find({ _id: { $in: arrConverted } })
      .toArray();
    return arrConfigs;
  } catch (err) {
    console.error('Error querying site configs:', err);
  } finally {
    await client.close();
  }
}

async function getSelectedConfigs(arrIds) {
  const arrConverted = arrIds.map((id) => ObjectId.createFromHexString(id));
  try {
    await client.connect();
    const db = client.db('job_scraper');
    const collection = db.collection('sites');
    const projection = { _id: 0 };
    const arrConfigs = await collection
      .find({ _id: { $in: arrConverted } }, { projection })
      .toArray();
    return arrConfigs;
  } catch (err) {
    console.error('Error querying site config:', err);
  } finally {
    await client.close();
  }
}

export { connectToDb, getPremadeConfigs, getSelectedConfigs, insertSite };
