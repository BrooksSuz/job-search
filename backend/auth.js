import express from 'express';
import passport from 'passport';
import User from './User.js';
import { connectToDb } from './db.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(400).send('Error registering user');
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.send('Logged out');
  });
});

export default router;
