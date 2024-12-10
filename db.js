import { MongoClient, ServerApiVersion } from 'mongodb';
import arrConfigs from './public/site-configs.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function insertOneSite(arrConfigs) {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		const newSite = {
			url: 'https://example.com',
			siteName: 'Example Site',
			canWait: false,
			consent: 'accepted',
			errorMessages: [],
			isAnchor: true,
			listing: 'Job Title: Developer',
			nextPageDisabled: 'false',
			nextPageLink: '/nextPage',
			nextPageParent: 'div.pagination',
			lastScraped: new Date(),
		};

		const result = await collection.insertOne(newSite);
		console.log('Site inserted with _id:', result.insertedId);
	} catch (err) {
		console.error('Error inserting site:', err);
	} finally {
		await client.close();
	}
}

async function insertManySites(arrConfigs) {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		for (let config of arrConfigs) {
			await collection.updateOne(
				{ siteName: config.siteName },
				{ $set: config },
				{ upsert: true }
			);
		}
		console.log(`${arrConfigs.length} site(s) inserted or updated.`);
	} catch (err) {
		console.error('Error inserting sites:', err);
	} finally {
		await client.close();
	}
}

async function queryData() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		const documents = await collection.find({}).toArray();
		console.log('Documents found:');
		console.log(documents);
	} catch (err) {
		console.error('Error querying data:', err);
	} finally {
		await client.close();
	}
}

async function deleteData() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		const result = await collection.deleteOne({
			siteName: 'University of Michigan',
		});

		if (result.deletedCount === 1) {
			console.log('Document deleted');
		} else {
			console.log('No document found with that name');
		}
	} catch (err) {
		console.error('Error deleting document:', err);
	} finally {
		await client.close();
	}
}

async function deleteCollection() {
	try {
		await client.connect();
		const db = client.db('job_scraper');

		const result = await db.collection('user_websites').drop();

		console.log(result ? 'Collection deleted' : 'Collection not found');
	} catch (err) {
		console.error('Error deleting collection:', err);
	} finally {
		await client.close();
	}
}

async function updateData() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		const result = await collection.updateOne(
			{ siteName: 'Example Site' },
			{ $set: { consent: 'revoked' } }
		);

		if (result.matchedCount === 1) {
			console.log('Document updated');
		} else {
			console.log('No document found to update');
		}
	} catch (err) {
		console.error('Error updating document:', err);
	} finally {
		await client.close();
	}
}

async function getSiteConfigs() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');
		const arrConfigs = await collection.find({}).project({ _id: 0 }).toArray();
		return arrConfigs;
	} catch (err) {
		console.error('Error querying site configs:', err);
	} finally {
		await client.close();
	}
}

export { getSiteConfigs };
