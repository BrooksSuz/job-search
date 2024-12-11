import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import findListings from './find-listings.js';
import sendMail from './helpers/send-mail.js';
import { getSiteConfigs } from './db.js';
import bodyParser from 'body-parser';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(dirName, '../public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.sendFile(path.join(dirName, '../public', 'index.html'));
});

app.get('/api/listings', (req, res) => {
	const strSearchTerms = req.query.keywords;
	const objConfig = { ...req.query };
	delete objConfig.keywords;
	findListings(strSearchTerms, objConfig).then((listings) =>
		res.json(listings)
	);
});

app.get('/api/site-configs', async (req, res) => {
	try {
		const configs = await getSiteConfigs();
		res.json(configs);
	} catch (err) {
		console.error('Error fetching configs:', err);
		res.status(500).json({ error: 'Failed to fetch site configs' });
	}
});

app.post('/api/send-mail', async (req, res) => {
	const { html } = req.body;
	console.log('Received HTML:', html);
	res.status(200).send('HTML received');
	sendMail(html);
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
