const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
import passport from 'passport';
import config from '../../config';

export default {
    jwtStrategyMiddleware: async () =>
        passport.use(
            new JWTstrategy(
                {
                    secretOrKey: config.authTokenSecret,
                    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                },
                async (token: any, done: any) => {
                    try {
                        done(null, token.user);
                    } catch (error) {
                        done(error);
                    }
                }
            )
        ),
};
