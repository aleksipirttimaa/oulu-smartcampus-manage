import * as jwtConfig from './jwt';

import passport from "passport";

import passportJwt from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import * as ApiKey from '../models/apikey';
import * as User from '../models/user';

const JwtStrategy = passportJwt.Strategy;

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
        secretOrKey: jwtConfig.secret,
    },
    (jwt_payload, done) => {
        User.getUserById(jwt_payload.data._id, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                if (user.email === '' && user.password === '') {
                    // deleted user
                    return done(null, false);
                }
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }
));

passport.use(new HeaderAPIKeyStrategy(
    { header: 'Authorization', prefix: 'Api-Key ' },
    false,
    (key, done) => {
        ApiKey.getByKey(key, ((err, res) => {
            if (err) {
                return done(err);
            }
            if (!res) {
                return done(null, false);
            }
            User.getUserById(res.owner, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (user.email === '' && user.password === '') {
                    // deleted user
                    return done(null, false);
                }
                return done(null, user);
            });
        }));
    }
));