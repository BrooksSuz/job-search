import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
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
import cors from 'cors';
import Queue from 'bull';
import { WebSocketServer } from 'ws';
import http from 'http';
import { createClient } from 'redis';
import Redis from 'ioredis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const redisUrl = process.env.REDIS_URL;
const channelName = process.env.CHANNEL_NAME;
const pubClient = new Redis(redisUrl);
const subClient = new Redis(redisUrl);

connectRedis();

const queueName =
  process.env.NODE_ENV === 'production' ? 'prodUserQueue' : 'devUserQueue';
const userQueue = new Queue(queueName, redisUrl);

// Connect to the database
connectToDb();

wss.on('connection', (ws) => {
  ws = ws;
  logger.info('New client connected.');

  ws.on('open', () => {
    logger.info('Websocket connection opened.');
  })

  ws.on('message', (message) => {
    const strMessage = message.toString();
    if (strMessage === 'ping') {
      logger.info('pong');
      ws.send('pong');
    }
  });

  ws.on('close', () => {
    logger.info('Client disconnected');
    subClient.unsubscribe(channelName);
  });

  subClient.subscribe(channelName, (err) => {
    if (err) {
      logger.error(`Failed to subscribe: ${err}`);
    } else {
      logger.info(`Successfully subscribed to channel: ${channelName}`);
    }
  });

  subClient.on('message', (channel, message) => {
    if (channel === channelName) {
      if (ws && ws.readyState === ws.OPEN) {
        ws.send(message);
      } else {
        logger.error('WebSocket is not open. Cannot send message.');
      }
    }
  });
});

// Trust all proxies
app.set('trust proxy', true);

// Middleware
app.use(express.static(path.join(dirName, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
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
app.use(
  cors({
    origin: [process.env.FRONTEND_URL_1, process.env.FRONTEND_URL_2],
    credentials: true,
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
    const { arrIds } = req.body;
    const user = req.user;

    if (!arrIds) {
      const arrStoredIds = user._doc.sites;
      const objStoredConfig = await getSelectedConfigs(arrStoredIds);
      res.json(objStoredConfig);
      return;
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

app.post('/api/listings', async (req, res) => {
  try {
    const { keywords, objConfig } = req.body;
    const job = await userQueue.add(
      { keywords, objConfig },
      { removeOnComplete: true, removeOnFail: true }
    );
    const jobId = job.id;
    logger.info(`Job added to queue: ${job.id}`);
    logger.info(channelName);
    pubClient.publish(
      channelName,
      JSON.stringify({ jobId, status: 'added' })
    );
    res.json({ jobId });
  } catch (err) {
    logger.error(`Error in request /api/listings:\n${err}`);
    res.status(500).json({ error: 'Failed to add job to the queue.' });
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
      req.session.destroy((sessionErr) => {
        if (sessionErr) return next(sessionErr);
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'User deleted and logged out' });
      });
    });
  } catch (err) {
    logger.error(`Error in request /api/delete-user:\n${err}`);
    res.status(500).json({ error: 'Error deleting user.' });
  }
});

server.listen(PORT, () => {
  logger.info(`\nServer running at: http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
	try {
		await mongoose.connection.close();
		logger.info('\nMongoose disconnected through app termination');
		process.exit(0);
	} catch (err) {
		logger.error(`\nError closing MongoDB connection: ${err}`);
		process.exit(1);
	}
});

process.on('SIGTERM', async () => {
	try {
		await mongoose.connection.close();
		logger.info('\nMongoDB connection closed.');
		process.exit(0);
	} catch (err) {
		logger.error(`\nError closing MongoDB connection: ${err}`);
		process.exit(1);
	}
});

async function connectRedis() {
  try {
    await pubClient.ping().then(res => logger.info(res));
    await subClient.ping().then((res) => logger.info(res));
  } catch (err) {
    logger.error(`Error connecting to Redis: ${err}`);
  }
}
