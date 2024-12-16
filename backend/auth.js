import express from 'express';
import User from './schemas/User.js';
import passport from './passport-config.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
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
    console.error('Error during registration:');
    res.status(400).send('Error registering user');
  }
});

// Login
router.post('/login', passport.authenticate('local'), async (req, res) => {
  const projection = { _id: 1, siteName: 1 };
  try {
    const user = await User.findById(req.user._id, projection)
      .populate('sites', projection)
      .exec();
    res.json({ message: 'Logged in successfully', user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.send('Logged out');
  });
});

export default router;
