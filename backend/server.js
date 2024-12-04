import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import executeJobSearch from './main.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const app = express();
const countObj = { count: 0 };

app.use(express.static(path.join(dirName, '../public')));

app.get('/api/jobs', (req, res) => {
  const keywords = req.query.input;
  const advancedParams = { ...req.query };
  delete advancedParams.keywords;
  countObj.count = 0;

  executeJobSearch(keywords, advancedParams, countObj).then((jobs) =>
    res.json(jobs)
  );
});

app.get('/api/count', (req, res) => {
  const count = countObj.count;
  res.json({ count });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(dirName, '../public', 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export { countObj };
