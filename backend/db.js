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

async function insertOneSite() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		const newSite = {
			url: 'https://example.com',
			siteName: 'Example Site',
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

async function insertManySites() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		for (let objConfig of arrConfigs) {
			await collection.updateOne(
				{ siteName: objConfig.siteName },
				{ $set: objConfig },
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

async function updateManySites() {
	try {
		await client.connect();
		const db = client.db('job_scraper');
		const collection = db.collection('sites');

		for (let objConfig of arrConfigs) {
			await collection.updateMany(
				{ siteName: objConfig.siteName },
				{ $unset: { timeout: 0 } }
			);
		}
		console.log(`${arrConfigs.length} site(s) updated.`);
	} catch (err) {
		console.error('Error updating sites:', err);
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

		const result = await db.collection('sites').drop();

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
			{ siteName: 'University of Michigan' },
			{ $set: { timeout: 10000 } }
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

export { connectToDb, getPremadeConfigs, getSelectedConfigs, insertOneSite };
