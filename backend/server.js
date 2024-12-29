import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import scrapeListings from './scrape-listings/scrape-listings.js';
import sendMail from './scrape-listings/send-mail.js';
import authRoutes from './auth-backend.js';
import {
	connectToDb,
	deleteUser,
	getPremadeConfigs,
	getSelectedConfigs,
	mongoose,
} from './db.js';
import passport from './passport-config.js';
import Site from './schemas/Site.js';
import User from './schemas/User.js';
import logger from './logger-backend.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const secret = process.env.SECRET;

// Trust all proxies, including Cloudflare
app.set('trust proxy', true);

// Connect to the database
connectToDb();

// Middleware
app.use(express.static(path.join(dirName, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: secret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000,
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
		},
		store: MongoStore.create({
			client: mongoose.connection.getClient(),
			collectionName: 'sessions',
			dbName: process.env.DB,
		}),
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
	if (process.env.NODE_ENV === 'production') {
		logger.error(`Error in request ${req.method} ${req.originalUrl}:\n${err}`);
		res.status(500).send('Something went wrong');
	} else {
		next(err);
	}
});

app.post('/api/log', (req, res) => {
	const { level, message } = req.body;

	logger[level](message);
	res.status(200).send('Log received');
});

app.get('/', (req, res) => {
	res.sendFile(path.join(dirName, '../public', 'index.html'));
});

app.get('/api/user', (req, res) => {
	try {
		// Check for an active session
		if (!req.user) {
			res.send(false);
		} else {
			res.send(req.user);
		}
	} catch (err) {
		logger.error(`Error in request /api/user:\n${err}`);
		res.status(500).json({ error: 'Server error' });
	}
});

app.get('/api/listings', (req, res) => {
	try {
		const strSearchTerms = req.query.keywords;
		const objConfig = { ...req.query };
		delete objConfig.keywords;
		scrapeListings(strSearchTerms, objConfig).then((listings) =>
			res.json(listings)
		);
	} catch (err) {
		logger.error(`Error in request /api/listings:\n${err}`);
		res.status(500).json({ error: 'Failed to fetch site listings.' });
	}
});

app.get('/api/premade-configs', async (req, res) => {
	try {
		const arrConfigs = await getPremadeConfigs();
		res.json(arrConfigs);
	} catch (err) {
		logger.error(`Error in request /api/premade-configs:\n${err}`);
		res.status(500).json({ error: 'Failed to fetch site configs.' });
	}
});

app.post('/api/user-configs', async (req, res) => {
	try {
		const user = req.user;
		let arrIds;

		if (user) {
			arrIds = user._doc.sites;
		} else {
			({ arrIds } = req.body);
		}

		const objConfig = await getSelectedConfigs(arrIds);
		res.json(objConfig);
	} catch (err) {
		logger.error(`Error in request /api/user-configs:\n${err}`);
		res.status(500).json({ error: 'Failed to fetch site config.' });
	}
});

app.post('/api/add-config', async (req, res) => {
	try {
		const user = req.user;
		const { objSiteData } = req.body;
		objSiteData.errorMessages = objSiteData.errorMessages.split(',');
		const newSite = new Site(objSiteData);
		await newSite.save();
		logger.error(`User: ${user}`);
		user.sites.push(newSite._id);
		await user.save();

		res.json({
			id: newSite._id,
		});
	} catch (err) {
		logger.error(`Error in request /api/add-config:\n${err}`);
		res.status(500).json({ error: 'Failed to insert site config.' });
	}
});

app.post('/api/remove-config', async (req, res) => {
	const session = await mongoose.startSession();
	try {
		const user = req.user;
		const { selectedValues } = req.body;
		session.startTransaction();

		for (const value of selectedValues) {
			await Site.deleteOne({ _id: value }, { session });
			await User.updateOne(
				{ _id: user._id },
				{ $pull: { sites: value } },
				{ session }
			);
		}

		await session.commitTransaction();

		res.send();
	} catch (err) {
		await session.abortTransaction();
		logger.error(`Error in request /api/remove-config:\n${err}`);
		res.status(500).json({ error: 'Failed to remove site config.' });
	} finally {
		await session.endSession();
	}
});

app.post('/api/listings-mail', async (req, res) => {
	const { html } = req.body;
	logger.info(`\nHTML received:\n${html}`);
	res.status(200).send('HTML received');
	sendMail(html);
});

app.delete('/api/delete-user', async (req, res) => {
	try {
		const user = req.user;
		if (!user) return res.status(404).json({ error: 'User not found' });

		await deleteUser(user);

		req.logout((err) => {
			if (err) throw err;
			res.status(200).json({ message: 'User deleted and logged out' });
		});
	} catch (err) {
		logger.error(`Error in request /api/delete-user:\n${err}`);
		res.status(500).json({ error: 'Error deleting user.' });
	}
});

process.on('SIGTERM', () => {
	logger.info('SIGTERM received. Closing server...');
	app.close(() => {
		logger.info('Server closed.');
		mongoose.connection.close(() => {
			logger.info('MongoDB connection closed.');
			process.exit(0);
		});
	});
});

app.listen(port, () => {
	logger.info(`\nServer running at: http://localhost:${port}`);
});
