import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import executeJobSearch from './scraper.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const app = express();

app.use(express.static(path.join(dirName, '../public')));

app.get('/api/jobs', (req, res) => {
  executeJobSearch(['assis'])
    .then((jobs) => res.json(jobs))
    .catch((err) => res.status(500).json({ error: 'Failed to scrape jobs' }));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(dirName, '../public', 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
