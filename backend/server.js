import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import configurePassport from './passport.js';
import authRoutes from './auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import findListings from './find-listings.js';
import sendMail from './helpers/send-mail.js';
import { getSiteConfigs } from './db.js';

const app = express();
const port = process.env.PORT || 3000;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

app.use(express.static(path.join(dirName, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;
const secret = process.env.SECRET;
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: uri }),
  })
);

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);

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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).send('Unauthorized');
}
