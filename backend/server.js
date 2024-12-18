import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import scrapeListings from '../scrape-listings.js';
import sendMail from '../scrape-listings/send-mail.js';
import authRoutes from './auth-backend.js';
import {
  mongoose,
  connectToDb,
  getPremadeConfigs,
  getSelectedConfigs,
  insertSite,
} from './db.js';
import passport from './passport-config.js';
import Site from './schemas/Site.js';
import User from './schemas/User.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const uri = process.env.MONGO_URI;
const secret = process.env.SECRET;

// Connect to the database
connectToDb();

// Middleware
app.use(express.static(path.join(dirName, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
    store: MongoStore.create({
      mongoUrl: uri,
      collectionName: 'sessions',
      dbName: 'job_scraper',
    }),
  })
);
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(dirName, '../public', 'index.html'));
});

app.get('/api/listings', (req, res) => {
  const strSearchTerms = req.query.keywords;
  const objConfig = { ...req.query };
  delete objConfig.keywords;
  scrapeListings(strSearchTerms, objConfig).then((listings) =>
    res.json(listings)
  );
});

app.get('/api/premade', async (req, res) => {
  try {
    const arrConfigs = await getPremadeConfigs();
    res.json(arrConfigs);
  } catch (err) {
    console.error('Error fetching configs.', err);
    res.status(500).json({ error: 'Failed to fetch site configs.' });
  }
});

app.post('/api/configs', async (req, res) => {
  const { arrIds } = req.body;
  try {
    const objConfig = await getSelectedConfigs(arrIds);
    res.json(objConfig);
  } catch (err) {
    console.error('Error fetching config.', err);
    res.status(500).json({ error: 'Failed to fetch site config.' });
  }
});

app.post('/api/add', ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const { objUserData } = req.body;
    const newSiteId = new mongoose.Types.ObjectId();
    objUserData._id = newSiteId;
    await insertSite(objUserData);
    user.sites.push(newSiteId);
    await user.save();

    res.json({
      id: newSiteId,
    });
  } catch (err) {
    console.error('Error adding site config.', err);
    res.status(500).json({ error: 'Failed to insert site config.' });
  }
});

app.post('/api/remove', ensureAuthenticated, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const user = req.user;
    const { selectedValues } = req.body;
    session.startTransaction();

    for (const value of selectedValues) {
      await Site.deleteOne({ _id: selectedValues }, { session });
      await User.updateOne(
        { _id: user.id },
        { $pull: { sites: value } },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      message: 'Site(s) removed successfully',
      siteId: selectedValues,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Error removing site config.', err);
    res.status(500).json({ error: 'Failed to remove site config.' });
  } finally {
    session.endSession();
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

// Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
