import express from 'express';
import passport from './passport-config.js';
import User from './schemas/User.js';
import logger from './logger-backend.js';

const authRoutes = express.Router();

authRoutes.post('/register', async (req, res) => {
	const { email, password } = req.body;
	try {
		const existingUser = await User.findOne({ email });

		// Guard clause: Already has an account
		if (existingUser)
			return res.status(400).json({ message: 'Email already in use.' });

		const user = new User({ email, password });
		await user.save();
		res.status(201).send('User registered');
	} catch (err) {
		logger.error('Error in request /register:', err);
		res.status(400).send('Error registering user');
	}
});

authRoutes.post('/login', passport.authenticate('local'), async (req, res) => {
	const { email, password } = req.body;
	const projection = { _id: 1, siteName: 1 };
	let user;
	try {
		if (req.user) {
			user = await User.findById(req.user._id, projection)

				.populate('sites', projection)
				.exec();
			res.json({ message: 'Logged in successfully', user: user });
			return;
		} else {
			user = await User.findById(req._doc.user._id, projection)
				.populate('sites', projection)
				.exec();
			res.json({ message: 'Logged in successfully', user: user });
		}
		res.status(401).json({ message: 'Invalid credentials' });
	} catch (err) {
		res.status(500).json({ error: `An error occurred: ${err}` });
	}
});

authRoutes.get('/logout', (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.send('Logged out');
	});
});

export default authRoutes;
