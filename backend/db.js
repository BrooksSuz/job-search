import { MongoClient, ServerApiVersion } from 'mongodb';

const uri =
	'mongodb+srv://BrooksSuz:W4pOz0uC6DIlQoYq@job-scraper-cluster.annto.mongodb.net/?retryWrites=true&w=majority&appName=job-scraper-cluster';

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function connectToDB() {
	try {
		await client.connect();
		console.log('Connected to MongoDB');
		return client.db('job_scraper'); // Replace with your database name
	} catch (err) {
		console.error('Unexpected error in function connectToDB:', err);
	}
}

export default connectToDB;
