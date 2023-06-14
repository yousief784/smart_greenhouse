import { Router } from 'express';
import passport from 'passport';
import User from '../../schema/userSchema';

const localStrategy: Router = Router();

localStrategy.use(passport.initialize());
localStrategy.use(passport.session());

// Passport Local Strategy
passport.use(User.createStrategy());

// To use with sessions
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err: object, user: any) => {
        done(err, user);
    });
});

export default localStrategy;
