import { MongoClient, ServerApiVersion } from 'mongodb';
import { throwErrorAndHalt } from './custom-error.js';

async function updateDatabase(site) {
	const [[siteName, listings]] = Object.entries(site);
	try {
		await insertListings(siteName, listings);
		console.log(`Successfully inserted listings for ${siteName}`);
	} catch (err) {
		throwErrorAndHalt(err, 'updateDatabase');
	}
}

const insertListings = async (siteName, listings) => {
	const db = await connectToDB();
	const collection = db.collection('job_listings');
	try {
		const existingsite = await collection.findOne({ site_name: siteName });
		if (existingsite) {
			// Update existing siteanization
			await collection.updateOne(
				{ site_name: siteName },
				{ $push: { listings: { $each: listings } } } // Add new listings
			);
		} else {
			// Insert new siteanization with listings
			await collection.insertOne({ site_name: siteName, listings });
		}
		console.log('Listings inserted.');
	} catch (err) {
		throwErrorAndHalt(err, 'insertListings');
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
