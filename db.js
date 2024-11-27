import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017'; // Default MongoDB URI
const client = new MongoClient(uri);

async function connectToDB() {
	try {
		await client.connect();
		console.log('Connected to MongoDB');
		return client.db('job_scraper'); // Replace with your database name
	} catch (error) {
		console.error('MongoDB connection error:', error);
	}
}

export default connectToDB;
