import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import findListings from './find-listings.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(dirName, './public')));

app.get('/api/listings', (req, res) => {
	const strSearchTerms = req.query.keywords;
	const objConfig = { ...req.query };
	delete objConfig.keywords;
	findListings(strSearchTerms, objConfig).then((listings) =>
		res.json(listings)
	);
});

app.get('/', (req, res) => {
	res.sendFile(path.join(dirName, './public', 'index.html'));
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
