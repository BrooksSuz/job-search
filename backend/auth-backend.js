import express from 'express';
import passport from './passport-config.js';
import User from './schemas/User.js';

const authRoutes = express.Router();

authRoutes.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const user = new User({ email, password });
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    logger.error('Error during registration:', err);
    res.status(400).send('Error registering user');
  }
});

authRoutes.post('/login', passport.authenticate('local'), async (req, res) => {
  const projection = { _id: 1, siteName: 1 };
  try {
    const user = await User.findById(req.user._id, projection)
      .populate('sites', projection)
      .exec();

    if (user) {
      req.session.user = user;
      res.json({ message: 'Logged in successfully', user: user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    logger.error('Error during login:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

authRoutes.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.send('Logged out');
  });
});

export default authRoutes;
