import { MongoClient, ServerApiVersion } from 'mongodb';
import throwErrorAndHalt from '../error.js';

async function updateDatabase(org) {
  const [[orgName, listings]] = Object.entries(org);
  try {
    await insertJobListings(orgName, listings);
    console.log(`Successfully inserted listings for ${orgName}`);
  } catch (err) {
    throwErrorAndHalt(err, 'updateDatabase');
  }
}

const insertJobListings = async (orgName, listings) => {
  const db = await connectToDB();
  const collection = db.collection('job_listings');
  try {
    const existingOrg = await collection.findOne({ org_name: orgName });
    if (existingOrg) {
      // Update existing organization
      await collection.updateOne(
        { org_name: orgName },
        { $push: { listings: { $each: listings } } } // Add new listings
      );
    } else {
      // Insert new organization with listings
      await collection.insertOne({ org_name: orgName, listings });
    }
    console.log('Job listings inserted.');
  } catch (err) {
    throwErrorAndHalt(err, 'insertJobListings');
  }
};

const connectToDB = async () => {
  const uri =
    'mongodb+srv://BrooksSuz:W4pOz0uC6DIlQoYq@job-scraper-cluster.annto.mongodb.net/?retryWrites=true&w=majority&appName=job-scraper-cluster';

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('job_scraper');
  } catch (err) {
    throwErrorAndHalt(err, 'connectToDB');
  }
};

export default updateDatabase;
