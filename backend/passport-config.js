import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './User.js';

passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email });
				if (!user) return done(null, false, { message: 'User not found' });

				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch)
					return done(null, false, { message: 'Incorrect password' });

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	)
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id).exec();
		done(null, user);
	} catch (err) {
		done(err);
	}
});

export default passport;
