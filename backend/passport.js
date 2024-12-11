import { Strategy as LocalStrategy } from 'passport-local';
import User from './User.js';
import bcrypt from 'bcryptjs';

function configurePassport(passport) {
  passport.use(
    new LocalStrategy(async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!email) return done(null, false, { message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) =>
    User.findById(id, (err, user) => done(err, user))
  );
}

export default configurePassport;
