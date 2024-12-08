import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { findListings } from './find-listings.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const app = express();

app.use(express.static(path.join(dirName, './public')));

app.get('/api/listings', (req, res) => {
  const keywords = req.query.input;
  const advancedParams = { ...req.query };
  delete advancedParams.keywords;

  findListings(keywords, advancedParams).then((listings) => res.json(listings));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(dirName, './public', 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
